uniform float time;
uniform float progress;
uniform float width;
uniform float scaleX;
uniform float scaleY;
uniform float transition;
uniform float radius;
uniform float intensity;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D displacement;
uniform vec4 resolution;

uniform vec2 hover;
uniform float hoverState;

varying vec2 vUv;
uniform vec2 uUvScale;
uniform vec2 uUvScale2;
uniform sampler2D uImage;
uniform sampler2D uImage2;
varying float vNoise;
void main() {

	vec2 newUV = (vUv - 0.5) * uUvScale + 0.5;
	;
	vec2 newUV2 = (vUv - 0.5) * uUvScale2 + 0.5;
	;

	// vec2 newUV = vUv;

	// vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);

	vec4 d1 = texture2D(uImage, newUV);
	vec4 d2 = texture2D(uImage2, newUV);

	float displace1 = (d1.r + d1.g + d1.b) * 0.33;
	float displace2 = (d2.r + d2.g + d2.b) * 0.33;

	vec4 t1 = texture2D(uImage, vec2(newUV.x, newUV.y + hoverState * (displace2 * 0.3)));
	vec4 t2 = texture2D(uImage2, vec2(newUV2.x, newUV2.y + (1.0 - hoverState) * (displace1 * 0.3)));

	gl_FragColor = mix(t1, t2, hoverState);

	// vec4 texture = texture2D(uImage2, vUv);
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	// gl_FragColor = texture;
	// gl_FragColor = vec4(vUv,0.,1.);
	// gl_FragColor = vec4(vNoise,0.,0.,1.);
}