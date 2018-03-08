varying float noise;

void main() {

  vec3 color = vec3(0.4 - 1. * noise , 0.35 - 1. * noise , 0.13 - 1. * noise);
  gl_FragColor = vec4( color.rgb, 1.0 );

}