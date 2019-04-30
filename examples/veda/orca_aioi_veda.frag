/*{ "osc": 5000 }*/
precision mediump float;

uniform vec2 resolution;
uniform sampler2D osc_sample;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  gl_FragColor = texture2D(osc_sample, uv);
}
