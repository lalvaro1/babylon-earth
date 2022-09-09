#ifdef GL_ES
    precision mediump float;
#endif

varying vec2 vUV;
varying vec3 vPosition;

uniform vec3 cameraPosition;

uniform mat4 view;
uniform float canvas_width;
uniform float canvas_height;
uniform float time;
uniform vec3 sun;

uniform sampler2D night;

const float ROTATION_SPEED = 0.0;

void main(void) {

    float textureAnimation = time * ROTATION_SPEED;
    vec2 uv = -vec2(vUV.x - textureAnimation, vUV.y);

    vec3 nightGroundTexture = texture(night, uv).rgb;    

    gl_FragColor = vec4(nightGroundTexture, 1.);

    //gl_FragColor = vec4(vec3(diff), 1.);
}
