varying vec3 v_normal;
varying vec3 v_position;
uniform vec3 u_light;

float diffusion (vec3 lightDirection, vec3 normal) {
    return max(0.0, dot(normalize(lightDirection), normalize(normal)));
}

void main() {
    vec3 lightDirection = u_light - v_position;
    float diffusion = diffusion(lightDirection, v_normal);
    gl_FragColor = vec4(vec3(v_position), 1.0);
}