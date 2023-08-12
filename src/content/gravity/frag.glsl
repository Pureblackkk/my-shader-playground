uniform sampler2D u_texture;
precision mediump float;

void main() {
    // Get the particle alpha value from the texture
    float alpha = texture2D(u_texture, gl_PointCoord).a;

    // Fragment shader output
    gl_FragColor = vec4(vec3(1), alpha);
}