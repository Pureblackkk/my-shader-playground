uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_frame;

varying vec3 v_position;
varying vec3 v_normal;

float calculateDiffusionFactor(vec3 lightDirection, vec3 normal) {
    float diffusionFactor = dot(normalize(lightDirection), normalize(normal));

    return max(0.0, diffusionFactor);
}

float calculateSpecularFactor(vec3 lightDirection, vec3 eyePosition, vec3 normal) {
    vec3 halfwayVector = (lightDirection + eyePosition) / length(lightDirection + eyePosition);
    return max(0.0, pow(dot(halfwayVector, normal), 5.0));
}

// Return a value between 1 and 0 indicating if the pixel is inside the circle
float circle(vec2 position, vec2 center, float radius) {
    float toCenterDistance = distance(position, center);
    return 1.0 - smoothstep(radius - 1.0, radius + 1.0, toCenterDistance);
}


void main() {
    float minResolution = min(u_resolution.x, u_resolution.y);
    vec3 scaledMouse = vec3((u_mouse - 0.5 * u_resolution) / minResolution, 0.5);
    vec3 pointLightDirection = scaledMouse - v_position;
    vec3 eyeDirectoin = cameraPosition - v_position;

    // Caculate diffuse factor
    float diffusionFactor = calculateDiffusionFactor(scaledMouse, v_normal);

    // Caculate specular factor
    float specularFactor = calculateSpecularFactor(pointLightDirection, eyeDirectoin, v_normal);

    // Define the grid length
    float gridLength = 10.0;
    float hightGridLength = 5.0;

    // Define the relative position
    vec2 relativePosition = mod(gl_FragCoord.xy, gridLength);

    // Calculate diffusion part color
    float diffusionColor = 1.0;

    float diffuseCircleRatio = circle(
        relativePosition, 
        vec2(gridLength / 2.0), 
        0.8 * gridLength * pow(1.0 - diffusionFactor, 2.0)
    );

    diffusionColor -= diffuseCircleRatio;
    diffusionColor = clamp(diffusionColor, 0.05, 1.0);

    vec4 diffusionPart = vec4(vec3(diffusionColor), 1);

    // Calculate specular part color
    vec3 specularColor = vec3(1, 0.318, 0.243);

    float specularCircleRatio = circle(
        relativePosition,
        vec2(hightGridLength / 2.0),
        0.8 * gridLength * pow(specularFactor, 2.0)
    );

    vec4 specularPart = vec4(specularColor, 1);

    gl_FragColor = mix(diffusionPart, specularPart, specularCircleRatio);
}