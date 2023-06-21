import { BUILD_INFO, COMMIT_INFO } from './constants';

function App() {
  return (
    <>
      <h1>Kenneth Pirman</h1>
      <section>
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
        | <span title="build date">{new Date(BUILD_INFO.buildTime).toLocaleDateString('fr')}</span>
      </footer>
    </>
  );
}

export default App;
