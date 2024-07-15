import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { UserIdProvider } from './UserIdContext';

function App() {
  return (
    <UserIdProvider>
      <div className="App">
        <Header />
        <Footer />
      </div>
    </UserIdProvider>
  );
}

export default App;
