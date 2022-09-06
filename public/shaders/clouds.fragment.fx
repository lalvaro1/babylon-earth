#ifdef GL_ES
    precision mediump float;
#endif

varying vec2 vUV;
varying vec3 vPosition;

uniform sampler2D layer1;
uniform sampler2D layer2;
//uniform sampler2D scattering;

uniform vec3 cameraPosition;

uniform mat4 view;
uniform float canvas_width;
uniform float canvas_height;
uniform float time;
uniform vec3 sun;

uniform float PARAM_diffuse;
uniform float PARAM_specular;
uniform float PARAM_specular_power;
uniform float PARAM_diffuse_threshold;
uniform float PARAM_ambient;
uniform float PARAM_meoband;
uniform float PARAM_normal_cheating_transition;
uniform float PARAM_normal_cheating_threshold;

vec2 hash22(vec2 p) {
    const vec3 HASHSCALE3 = vec3(.1031, .1030, .0973);

	vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

void main(void) {

    vec2 uv = -vUV;
    float alpha = texture(layer2, uv).r;
  
    vec3 pointNormal = normalize(vPosition);
    vec3 lightDir = normalize(sun);

    float diffuse  = max(dot(-lightDir, pointNormal), 0.0);
    diffuse = smoothstep(0., PARAM_diffuse_threshold, diffuse);

    vec3 cameraDir = -normalize(cameraPosition);
    float specular = pow(max(0., dot(reflect(lightDir, pointNormal), -cameraDir)), PARAM_specular_power);

    float lighting = PARAM_ambient + diffuse * PARAM_diffuse + specular * PARAM_specular;

    vec4 render = vec4(vec3(lighting), alpha);
        /*
    // meo band
    vec4 meoband_color = vec4(1,0,0,0.5);

    float latitude = asin(pointNormal.y);
    float transition = smoothstep(0.87, 0.875, abs(latitude));

    float bandalpha = mix(alpha, PARAM_meoband, transition);
    gl_FragColor = mix(render, vec4(vec3(alpha), PARAM_meoband), transition);
    */

    vec3 ray = normalize(cameraPosition - vPosition);
    float normalCheating = smoothstep(PARAM_normal_cheating_threshold, PARAM_normal_cheating_threshold+PARAM_normal_cheating_transition, abs(dot(pointNormal, ray)));

    gl_FragColor.rgb = vec3(lighting);
    gl_FragColor.a = alpha * normalCheating;    
}
