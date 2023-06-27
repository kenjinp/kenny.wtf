import { Effect, EffectAttribute, WebGLExtension } from 'postprocessing';
import { Camera, Uniform, Vector3 } from 'three';
import fragment from './Atmosphere.glsl';

export interface AtmosphereEffectPlanet {
  radius: number;
  origin: Vector3;
  atmosphereRadius: number;
}

export interface AtmosphereEffectSun {
  origin: Vector3;
  color: Vector3;
  intensity: number;
}

export interface AtmosphereEffectProps {
  camera: Camera;
  suns: AtmosphereEffectSun[];
  planets: AtmosphereEffectPlanet[];
  primarySteps?: number;
  lightSteps?: number;
}

// Effect implementation
export class AtmosphereEffect extends Effect {
  camera: Camera;
  suns: AtmosphereEffectSun[];
  planets: AtmosphereEffectPlanet[];
  constructor({ camera, suns, planets, primarySteps = 12, lightSteps = 8 }: AtmosphereEffectProps) {
    const cameraDirection = new Vector3();
    console.log('rendering atmosphere', { camera, suns, planets, primarySteps, lightSteps });
    camera.getWorldDirection(cameraDirection);
    super(
      'AtmosphereEffect',
      fragment
        .replace(/<planetsLength>/g, planets.length.toString())
        .replace(/<sunsLength>/g, suns.length.toString()),
      {
        // @ts-ignore
        uniforms: new Map<string, Uniform | { value: any }>([
          ['uCameraPosition', new Uniform(camera.position)],
          ['uCameraWorldDirection', new Uniform(cameraDirection)],
          ['uPrimarySteps', new Uniform(primarySteps)],
          ['uLightSteps', new Uniform(lightSteps)],
          ['uCameraWorldDirection', new Uniform(cameraDirection)],
          [
            'uPlanets',
            {
              value: planets
            }
          ],
          [
            'uSuns',
            {
              value: suns
            }
          ],
          ['uViewMatrixInverse', new Uniform(camera.matrixWorld)],
          ['uProjectionMatrixInverse', new Uniform(camera.projectionMatrixInverse)]
        ]),
        attributes: EffectAttribute.DEPTH,
        extensions: new Set([WebGLExtension.DERIVATIVES])
      }
    );
    this.planets = planets;
    this.suns = suns;
    this.camera = camera;
  }

  // UPDATE ALL OUR THINGS!
  update() {
    console.log('updating camera', this.camera);
    const cameraDirection = new Vector3();
    this.camera.getWorldDirection(cameraDirection);
    this.uniforms.get('uCameraWorldDirection')!.value = cameraDirection;
    this.uniforms.get('uCameraPosition')!.value = this.camera.position;
    this.uniforms.get('uViewMatrixInverse')!.value = this.camera.matrixWorld;
    this.uniforms.get('uProjectionMatrixInverse')!.value = this.camera.projectionMatrixInverse;
    this.uniforms.get('uPlanets').value = this.planets;
    this.uniforms.get('uSuns').value = this.suns;
  }
}
