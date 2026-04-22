import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="app-page">
      <Header />

      <main className="page-content">
        <h1 className="page-title">About</h1>
        <p className="page-subtitle">
          This app recommends movies using your quiz preferences and TMDB data.
        </p>
      </main>

      <Footer />
    </div>
  );
}