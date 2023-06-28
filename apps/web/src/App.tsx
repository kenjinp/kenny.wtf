import { Planet } from '@components/planet/Planet';
import { Project, ProjectProps } from '@components/project/Project';
import { ProjectList } from '@components/project/Project.style';
import { BUILD_INFO, COMMIT_INFO } from '@constants';
import {
  Atmosphere,
  AtmosphereEffectPlanet,
  AtmosphereEffectProps,
  AtmosphereEffectSun
} from '@hello-worlds/vfx';
import { OrbitControls } from '@react-three/drei';
import { Color, Vector3 } from 'three';
import { Scene } from './components/scene/Scene';
import { useDetectGPU } from './hooks/useDetectGPU';

const projects: ProjectProps[] = [
  {
    title: 'Hello Worlds',
    body: 'Javascript worlds at planetary scales. Real time planet (and more) rendering library for three.js or @react-three/fiber',
    projectUrl: 'https://worlds.kenny.wtf/',
    projectImage: '/islands.png'
  },
  {
    title: 'Hello Cities',
    body: 'A WIP map-generating rogue-like city building game',
    projectUrl: 'https://cities.kenny.wtf/',
    projectImage: '/city-example.jpg'
  },
  {
    title: 'Firmament',
    body: 'A WIP and (mostly failed) experimental MMO using distributed elixir, javelin ECS, and @react-three/fiber',
    projectUrl: 'https://firmament.kenny.wtf/',
    projectImage: '/firmament.png'
  },
  {
    title: 'Stellar Denizen',
    body: 'A WIP MMORPG - Star Citizen for the browser'
  }
];

const radius = 5_000;
const planetOrigin = new Vector3();
const planets: AtmosphereEffectPlanet[] = [
  {
    radius,
    origin: planetOrigin,
    atmosphereRadius: radius * 3,
    atmosphereDensity: 0.08
  }
];

const AU = 100_000;

const suns: AtmosphereEffectSun[] = [
  {
    origin: new Vector3(-1, 0.75, 1).multiplyScalar(AU / 20),
    color: new Vector3().fromArray(new Color(0x5fcde4).toArray()),
    intensity: 30
  }
];

const RTX: Record<number, Partial<AtmosphereEffectProps>> = {
  3: {
    primarySteps: 32,
    lightSteps: 12
  },
  2: {
    primarySteps: 16,
    lightSteps: 8
  },
  1: {
    primarySteps: 8,
    lightSteps: 6
  }
};

const RTXLabel = ['Null', 'Meager', 'Middling', 'Magnifique'];

const useAdjustedGPUTier = () => {
  const gpu = useDetectGPU();
  const tier = gpu?.tier || 1;
  return Math.min(Math.max(gpu?.isMobile ? tier - 1 : tier, 1), 3);
};

function App() {
  const gpuTier = useAdjustedGPUTier();

  const RTXProps = RTX[gpuTier];

  return (
    <>
      <Scene
        effects={[<Atmosphere key="atmosphere" suns={suns} planets={planets} {...RTXProps} />]}
      >
        <Planet radius={radius} position={planetOrigin} />
        <OrbitControls />
      </Scene>
      <div className="content">
        <section id="intro">
          <h1>Kenneth Pirman</h1>
          <h2>A friendly internet space about procedural world-building</h2>
          <p>
            Linguist-turned-programmer interested in answering the question "what gives a virtual
            point of interest a <em>sense of place</em>"?
          </p>
          <p>Creating procedural cities, planets, and worlds - mostly using web technologies</p>
        </section>
        <hr />

        <section id="projects">
          <h2>Projects</h2>
          <p>
            I'm aiming to create large rich worlds to explore with people together. I'm learning
            game development and graphics programming from first principles out in the open by
            working on these projects.
          </p>
          <p>
            Some of them have solidified into libraries which you can use in your own projects. Some
            of these projects are very bottom-up (city scale), and the others are top-down (planet
            scale). Other projects test distributed computing technologies to explore simulating
            virtual spaces efficiently.
          </p>
          <ProjectList>
            {projects.map((p) => (
              <Project key={p.title} {...p} />
            ))}
          </ProjectList>
        </section>
        <hr />

        <section id="contact">
          <h2>Contacts</h2>
          <p>Feel free to reach out :)</p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1em',
              flexWrap: 'wrap'
            }}
          >
            <a href="https://twitter.com/KennyPirman">twitter</a>
            <a href="mailto: hello@kenny.wtf">email: hello@kenny.wtf</a>
            <a href="https://github.com/kenjinp">github</a>
            <a href="https://www.linkedin.com/in/kenjinp/">linked-in</a>
          </div>
        </section>
        <hr />

        <footer className="main">
          <div>
            version{' '}
            <a
              title="commit hash"
              href={`https://github.com/kenjinp/kenny.wtf/commit/${COMMIT_INFO.hash}`}
            >
              {COMMIT_INFO.shortHash}
            </a>{' '}
          </div>
          <span title="build date">{new Date(BUILD_INFO.buildTime).toLocaleDateString('fr')}</span>
          <span>gfx: {RTXLabel[gpuTier]}</span>
        </footer>
      </div>
    </>
  );
}

export default App;
