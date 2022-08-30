#ifdef GL_ES
    precision highp float;
#endif

// Attributes
attribute vec3 position;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 world;
uniform float ratio;

// Normal
varying vec2 vUV;
varying vec3 wPosition;
varying vec3 lPosition;

void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
    wPosition = (world * vec4(position, 1.0)).xyz;
    lPosition = gl_Position.xyz;    
    lPosition.x *= ratio;
}