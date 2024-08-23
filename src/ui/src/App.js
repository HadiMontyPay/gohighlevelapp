import "./App.css";
import React, { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState({});

  const getUserData = async () => {
    const key = await new Promise((resolve) => {
      window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
      window.addEventListener("message", ({ data }) => {
        if (data.message === "REQUEST_USER_DATA_RESPONSE") {
          console.log("data", data.payload);
          resolve(data.payload);
        }
      });
    });
    const res = await fetch("/decrypt-sso", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    return data;
  };

  useEffect(() => {
    const data = getUserData();
    setUser(JSON.stringify(data, null, 4));
  }, []);
  return (
    <div className="App">
      <div>
        <h1>MontyPay Configuration</h1>
        <form>
          <fieldset>
            <legend>Merchant Info</legend>
            <label>
              Merchant Key:
              <input type="text" placeholder="Merchant Key" />
            </label>
            <label>
              Merchant Password:
              <input type="password" placeholder="Merchant Password" />
            </label>
          </fieldset>
          <button type="submit">Save</button>
        </form>
        <div>{/* {{ JSON.stringify(user, null, 4) }} */}</div>
        <div>{user.activeLocation}</div>
      </div>
    </div>
  );
}

export default App;
