import {
  ClampToEdgeWrapping,
  DataTexture,
  FloatType,
  LinearFilter,
  Loader,
  NoColorSpace,
  RedFormat,
} from "three/webgpu";

/** Infers square side length from raw 16-bit single-channel heightmap byte size. */
export function r16HeightmapSideLength(byteLength: number): number {
  const sampleCount = byteLength / 2;
  const side = Math.round(Math.sqrt(sampleCount));
  if (side * side !== sampleCount) {
    throw new Error(
      `R16 heightmap must be square (${sampleCount} uint16 samples)`,
    );
  }
  return side;
}

export function parseR16Heightmap(buffer: ArrayBuffer): DataTexture {
  const uint16 = new Uint16Array(buffer);
  const side = r16HeightmapSideLength(buffer.byteLength);
  const floatData = new Float32Array(uint16.length);
  const inv = 1 / 65535;

  for (let i = 0; i < uint16.length; i++) {
    floatData[i] = uint16[i]! * inv;
  }

  const texture = new DataTexture(
    floatData,
    side,
    side,
    RedFormat,
    FloatType,
  );
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = NoColorSpace;
  texture.flipY = true;
  texture.needsUpdate = true;
  return texture;
}

export class R16HeightmapLoader extends Loader<DataTexture> {
  load(
    url: string,
    onLoad: (texture: DataTexture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    this.manager.itemStart(url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load R16 heightmap: ${url}`);
        }
        onProgress?.(
          new ProgressEvent("progress", {
            loaded: 1,
            total: 1,
          }),
        );
        return response.arrayBuffer();
      })
      .then((buffer) => {
        onLoad(this.parse(buffer));
        this.manager.itemEnd(url);
      })
      .catch((err) => {
        this.manager.itemError(url);
        onError?.(err);
      });
  }

  parse(buffer: ArrayBuffer): DataTexture {
    return parseR16Heightmap(buffer);
  }
}
