import TextEditor from "./components/editor";
import Header from "./components/Layout/header";
import Footer from "./components/Layout/footer";
import './App.css';

const App = () => {

  return (<>
    <Header />
    <div className="main-container">
      <TextEditor />
    </div>
    <Footer />
  </>);
};

export default App;
