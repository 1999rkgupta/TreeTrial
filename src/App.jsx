import React from "react";

// import Tree from "./api/Tree";
import { Toaster } from "react-hot-toast";
import { TreeContextProvider } from "./api/ContextAPI";
import Tree1 from "./api/Tree1";

const App = () => {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />

      <TreeContextProvider>
        {/* <Tree /> */}
        <Tree1 />
      </TreeContextProvider>
    </div>
  );
};

export default App;
