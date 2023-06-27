import { Planet } from '@components/planet/Planet';
import { Project, ProjectProps } from '@components/project/Project';
import { ProjectList } from '@components/project/Project.style';
import { Atmosphere } from '@components/vfx/atmosphere/Atmosphere';
import { Scene } from './components/scene/Scene';
import { BUILD_INFO, COMMIT_INFO } from './constants';

const tilt = (beta: number, gamma: number) => {
  console.log({ beta, gamma });
};

if (window.DeviceOrientationEvent) {
  window.addEventListener(
    'deviceorientation',
    function () {
      console.log(event);
      tilt([event.beta, event.gamma]);
    },
    true
  );
} else if (window.DeviceMotionEvent) {
  window.addEventListener(
    'devicemotion',
    function () {
      console.log(event);
      tilt([event.acceleration.x * 2, event.acceleration.y * 2]);
    },
    true
  );
} else {
  window.addEventListener(
    'MozOrientation',
    function () {
      console.log(event);
      tilt([orientation.x * 50, orientation.y * 50]);
    },
    true
  );
}

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

function App() {
  return (
    <>
      <Scene effects={[<Atmosphere key="atmosphere" suns={[]} planets={[]}></Atmosphere>]}>
        <Planet />
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
        </footer>
      </div>
    </>
  );
}

export default App;
