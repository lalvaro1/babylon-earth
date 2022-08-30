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


vec2 hash22(vec2 p) {
    const vec3 HASHSCALE3 = vec3(.1031, .1030, .0973);

	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec2 getUV(in vec3 p, float rotation) {
    vec2 uv;
    uv.x = (atan(p.z, p.x) / 3.1415 + 1.0) * 0.5 + rotation;

    float r = length(p.xz);
    float alpha = atan(p.y, r);

    uv.y = (1.0 + alpha / 1.5708) * 0.5;

    return uv;
}




void main(void) {

    vec2 uv = getUV(vPosition, time * 0.015);

    // Normal map
    vec2 nmttext = texture(normal_map, uv).rg;
    vec3 material_normal = 2.0 * texture(normal_map, uv).rgb - 1.0;
  /*  
    material_normal.z *= 3.0;
    material_normal = normalize(material_normal);
*/
    material_normal.x = -(2.0 * nmttext.r - 1.0);
    material_normal.y = -(2.0 * nmttext.g - 1.0);    
    material_normal.z = 0.125;        
    material_normal = normalize(material_normal);

//material_normal=vec3(0,0,1);

    vec3 pointNormal = vPosition * 2.0;
    vec3 k = pointNormal;
    vec3 up = vec3(0.0,1.0,0.0);
    vec3 i = normalize(cross(up, k));
    vec3 j = cross(k, i);

    mat3 local = mat3(i, j, k); 
    vec3 localNormal = local * material_normal;

    mat4 camMat = transpose(view);
    vec3 lightDir = normalize((vec4(1,-0.15,0.5,0) * view).xyz);

    float sun  = max(-dot(lightDir, pointNormal), 0.0);
    float diff = pow(max(-dot(lightDir, localNormal), 0.0), 0.5);

    const float ambiant = 0.025;

    vec3 dayGround = texture(diffuse, uv).rgb * (ambiant + diff);
    vec3 nightGround = texture(night, uv).rgb * 1.2;    

    // clouds
    vec2 uv2 = getUV(vPosition, time * 0.02);

    vec3 clouds = texture(clouds, uv2).rgb;
    float clouding = pow(1.0 - clouds.r, 0.5);


    vec4 ground = vec4(mix(nightGround, dayGround, smoothstep(0.2, 0.33, sun)), 1.0) * clouding;

    vec4 mask = texture(mask, uv);

    vec3 camPos = camMat[3].xyz;
     camPos = cameraPosition;

    vec3 reflection = reflect(lightDir, localNormal);
    vec3 ray = normalize(camPos - vPosition);

    float specular = pow(clamp(dot(reflection, ray), 0.0, 1.0), 3.0) * 0.33;
    vec4 specularColor = vec4(1.0, 234.0/255.0, 77.0/255.0, 1.0);    

    gl_FragColor = ground + specularColor * specular * mask; //vec4(texture(diffuse, uv).rgb * diff, 1.0);

    gl_FragColor.a = 1.0;


/*
    gl_FragColor.rgb = localNormal;
    gl_FragColor.a = 1.0;

    gl_FragColor = mix(gl_FragColor, ground, 0.5);
*/
}

