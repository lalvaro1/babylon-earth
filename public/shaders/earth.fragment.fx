#ifdef GL_ES
    precision mediump float;
#endif

varying vec2 vUV;
varying vec3 vPosition;

uniform sampler2D diffuse;
uniform sampler2D normal_map;
uniform sampler2D night;
uniform sampler2D mask;
uniform sampler2D clouds;

uniform vec3 cameraPosition;

uniform mat4 view;
uniform float canvas_width;
uniform float canvas_height;
uniform float time;
uniform vec3 sun;

uniform float PARAM_specular;
uniform float PARAM_specular_power;
uniform float PARAM_diffuse;
uniform float PARAM_diffuse_power;
uniform float PARAM_day_ambient;
uniform float PARAM_night_boost;
uniform float PARAM_night_day_threshold;
uniform float PARAM_night_day_transition;
uniform float PARAM_cloud_shadow;
uniform float PARAM_bump;
uniform float PARAM_glow_attenuation;
uniform float PARAM_glow_distance_attenuation;

uniform vec3 PARAM_night_color;
uniform vec3 PARAM_specular_color;

vec2 hash22(vec2 p) {
    const vec3 HASHSCALE3 = vec3(.1031, .1030, .0973);

	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

/*
float atan2(in float y, in float x) {

    if(y == 0.) {
        if(x>0.) return 0.;
        return 3.14159265359;
    }

    return atan(y, x);
}
*/

const float ROTATION_SPEED = 0.0;

void main(void) {

    float textureAnimation = time * ROTATION_SPEED;
    vec2 uv = -vec2(vUV.x - textureAnimation, vUV.y);

    // Normal map
    vec2 nmttext = texture(normal_map, uv).rg;
    vec3 material_normal = 2.0 * texture(normal_map, uv).rgb - 1.0;
    material_normal.x = -(2.0 * nmttext.r - 1.0);
    material_normal.y = -(2.0 * nmttext.g - 1.0);    
    material_normal.z = PARAM_bump;        
    material_normal = normalize(material_normal);

    // Point normal
    vec3 pointNormal = normalize(vPosition);
    vec3 k = pointNormal;
    vec3 up = vec3(0.0,1.0,0.0);
    vec3 i = normalize(cross(up, k));
    vec3 j = cross(k, i);

    mat3 local = mat3(i, j, k); 
    vec3 localNormal = local * material_normal;

    // Light
    mat4 camMat = transpose(view);
    vec3 lightDir = normalize(sun*100. - vPosition);

    float sun_p_dot = dot(-lightDir, pointNormal);
    float sun  = clamp(sun_p_dot, 0.0, 1.0);

    //float sun  = smoothstep(-0.2, 1.0, sun_p_dot);


    float diff = pow(clamp(dot(-lightDir, localNormal), 0.0, 1.0), PARAM_diffuse_power) * PARAM_diffuse;

    // earth self shadow
    float approximateSelfShadow = 1. - smoothstep(0., 0.2, -sun_p_dot);
    diff *= approximateSelfShadow;

    // Ground texture (day/night)
    vec3 dayGroundTexture = texture(diffuse, uv).rgb;
    vec3 nightGroundTexture = texture(night, uv).rgb;    

    float day_night_mix = 1. - smoothstep(PARAM_night_day_threshold, PARAM_night_day_threshold + PARAM_night_day_transition, sun);

    // clouds
    vec3 clouds = texture(clouds, uv).rgb;
    float clouding = 1.0-(clouds.r);//*PARAM_cloud_shadow);

    // specular
    float mask = texture(mask, uv).r;
    vec3 reflection = reflect(lightDir, localNormal);
    vec3 ray = normalize(cameraPosition - vPosition);

    float specular = pow(clamp(dot(reflection, ray), 0.0, 1.0), PARAM_specular_power) * PARAM_specular;
    
    vec3 dayGround = (dayGroundTexture * (PARAM_day_ambient + diff) + (PARAM_specular_color * specular * mask)) * clouding;

    const float maxLightingAt = 0.71;
    float cameraDist = length(cameraPosition - vPosition);
    float distanceAttenuation = max(1. - cameraDist / PARAM_glow_distance_attenuation * (1. - PARAM_glow_attenuation), 0.);

    vec3 nightGround = nightGroundTexture * PARAM_night_color * clouding * distanceAttenuation;

    gl_FragColor = vec4(dayGround + nightGround * day_night_mix * PARAM_night_boost, 1.);

    //gl_FragColor = vec4(vec3(diff), 1.);
}

