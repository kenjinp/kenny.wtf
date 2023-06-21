import { Scene } from './components/scene/Scene';
import { BUILD_INFO, COMMIT_INFO } from './constants';

function App() {
  return (
    <>
      <Scene />
      <div style={{ padding: '2rem' }}>
        <section>
          <h1>Kenneth Pirman</h1>
          <h2>A friendly internet space about procedural generation and critical worldbuilding</h2>
          <p>
            Linguist-turned-programmer interested in answering the question "what gives a virtual
            space a <em>sense of place</em>"?
          </p>
          <p>Creating procedural cities, planets, and worlds - mostly using web technologies</p>
        </section>
        <hr />

        <footer className="main">
          version{' '}
          <a
            title="commit hash"
            href={`https://github.com/kenjinp/kenny.wtf/commit/${COMMIT_INFO.hash}`}
          >
            {COMMIT_INFO.shortHash}
          </a>{' '}
          |{' '}
          <span title="build date">{new Date(BUILD_INFO.buildTime).toLocaleDateString('fr')}</span>
        </footer>
      </div>
    </>
  );
}

export default App;
