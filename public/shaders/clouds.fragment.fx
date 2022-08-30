#ifdef GL_ES
    precision mediump float;
#endif

varying vec2 vUV;
varying vec3 vPosition;

uniform sampler2D layer1;
uniform sampler2D layer2;

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

    vec2 uv1 = getUV(vPosition, time * 0.02);
    vec2 uv2 = getUV(vPosition, (3.1415 + time) * 0.015);    

    uv2.y = 1.0 - uv2.y;
//uv2=uv1;
    vec3 pointNormal = vPosition * 2.0;
    vec3 k = pointNormal;
    vec3 up = vec3(0.0,1.0,0.0);
    vec3 i = normalize(cross(up, k));
    vec3 j = cross(k, i);

    mat3 local = mat3(i, j, k); 

    mat4 camMat = transpose(view);
    vec3 lightDir = normalize((vec4(1,-0.15,0.5,0) * view).xyz);

    float sun  = max(-dot(lightDir, pointNormal), 0.0);

    const float ambiant = 0.025;

    //vec3 clouds = texture(layer1, uv).rgb;
    vec3 alpha1 = texture(layer2, uv1).rgb;    
    vec3 alpha2 = texture(layer2, uv2).rgb;        

    float blending = max(alpha1, alpha2).r * sun;

    vec3 camPos = cameraPosition;
    vec3 ray = normalize(camPos - vPosition);

    float normalCheating = abs(dot(pointNormal, ray));

    blending *= smoothstep(0.0, 1.0, normalCheating);

    gl_FragColor.rbg = max(alpha1, alpha2);//clouds;
    gl_FragColor.a = smoothstep(0.,0.5, blending);

    //gl_FragColor = mix(gl_FragColor, vec4(173./255., 255./255., 248./255.,1.-normalCheating), 1. - normalCheating);
   
    float scatteringIntensity = pow(normalCheating/0.32, 4.);

    if(scatteringIntensity>0.99) scatteringIntensity = 0.;

    //gl_FragColor = mix(gl_FragColor, vec4(143./255., 150./255., 248./255.,scatteringIntensity), normalCheating);

    //gl_FragColor.a = 1.0;

    //gl_FragColor.rgb = vec3(smoothstep(0.0, 1.0, normalCheating));

/*
    gl_FragColor.rgb = localNormal;
    gl_FragColor.a = 1.0;

    gl_FragColor = mix(gl_FragColor, ground, 0.5);
*/
}