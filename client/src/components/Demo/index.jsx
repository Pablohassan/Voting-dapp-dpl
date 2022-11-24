import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";
// import Title from "./Title";

// import Contract from "./Contract";
import Vote from "./Vote";

import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";

function Demo() {
  const { state } = useEth();
  

  const demo = (
    <>
      <div className="contract-container">
        <Vote  />
      </div>
    </>
  );
  return (
    <div className="demo">
      {/* <Title /> */}
      {!state.artifact ? (
        <NoticeNoArtifact />
      ) : !state.contract ? (
        <NoticeWrongNetwork />
      ) : (
        demo
      )}
    </div>
  );
}

export default Demo;
