import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { Grid, Card, Text, Input, Button, Row } from "@nextui-org/react";
import Proposals from "./Proposals";

function Vote() {
  const {
    state: { contract, accounts, web3 },
  } = useEth();
  const [owner, setOwner] = useState(""); // ici on met l'owner
  const [dropdownProp, setDropdownProp] = useState(""); // notre menu pour choisir la proposal
  const [inputAddress, writeInputAddress] = useState(""); // l'adresse du voter
  const [currentWorkflow, setWfArr] = useState(""); // l'état du wf actuel
  const [winningProposal, setWinningProposal] = useState("");
  const [proposals, setProposals] = useState([""]); // les propositions des voteurs
  const [voterProp, setVoterProp] = useState([]); // la proposition du voter
  const [proposalEvents, setProposalEvents] = useState([""]); // event lié aux proposals
  const [oldProposalEvents, setOldProposalEvents] = useState([]); // les proposales déja indéxés
  const [proposalVoted, setProposalVoted] = useState(""); // la proposale voté
  const [oldVotedEvents, setOldVotedEvents] = useState(""); // evenements liés aux adresses
  const [votedEvents, setVotedEvents] = useState([""]);
  const [oldEventsAddr, setOldEvents] = useState([""]);
  const [eventAddr, setEventAddr] = useState("");
  const [workflow, setWfStatus] = useState("");
  const [eventWorkflow, setEventWorkflow] = useState("");
  const [oldWorkflowEvents, setOldWorkflowEvents] = useState([""]);

  useEffect(() => {
    (async function () {
      if (contract) {
        const owner = await contract.methods
          .owner()
          .call({ from: accounts[0] });
        const isOwner = owner === accounts[0] ? true : false;
        setOwner(isOwner);
      }
    })();
  }, [contract, accounts]);

  console.log(winningProposal);

  useEffect(() => {
    (async function () {
      let oldVotedEvents = await contract.getPastEvents("Voted", {
        fromBlock: 0,
        toBlock: "latest",
      });
      let oldVoted = [];
      oldVotedEvents.forEach((event) => {
        oldVoted.push(event.returnValues.voter.proposalId);
      });
      setOldVotedEvents(oldVoted);
      await contract.events
        .Voted({ fromBlock: "earliest" })
        .on("data", (event) => {
          let lesevents = event.returnValues.voter;
          setVotedEvents(lesevents);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));
    })();
  }, [contract, accounts]);

  useEffect(() => {
    (async function () {
      let oldProposalEvents = await contract.getPastEvents(
        "ProposalRegistered",
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      );
      let oldProposal = [];
      oldProposalEvents.forEach((event) => {
        oldProposal.push(event.returnValues.proposalId);
      });
      setOldProposalEvents(oldProposal);
      await contract.events
        .ProposalRegistered({ fromBlock: "earliest" })
        .on("data", (event) => {
          let lesPropevents = event.returnValues.proposalId;
          setProposalEvents(lesPropevents);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));
    })();
  }, [contract, accounts]);

  useEffect(() => {
    (async function () {
      let oldWorkflowEvents = await contract.getPastEvents(
        "WorkflowStatusChange",
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      );
      let oldwf = [];
      oldWorkflowEvents.forEach((event) => {
        oldwf.push(event.returnValues.WorkflowStatus);
      });
      setOldWorkflowEvents(oldwf);

      await contract.events
        .VoterRegistered({ fromBlock: "earliest" })
        .on("data", (event) => {
          let lesevents = event.returnValues.WorkflowStatus;
          setEventWorkflow(lesevents);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));
    })();
  }, [contract, accounts]);

  useEffect(() => {
    (async function () {
      let oldEventsAddr = await contract.getPastEvents("VoterRegistered", {
        fromBlock: 0,
        toBlock: "latest",
      });
      let oldies = [];
      oldEventsAddr.forEach((event) => {
        oldies.push(event.returnValues.voterAddress);
      });
      setOldEvents(oldies);

      await contract.events
        .VoterRegistered({ fromBlock: "earliest" })
        .on("data", (event) => {
          let lesevents = event.returnValues.voterAddress;
          setEventAddr(lesevents);
        })
        .on("changed", (changed) => console.log(changed))
        .on("error", (err) => console.log(err))
        .on("connected", (str) => console.log(str));
    })();
  }, [contract, accounts]);

  // selecteur de proposition de vote
  const options = oldProposalEvents.map((proposal, index) => {
    return (
      <option key={index} value={proposal}>
        {proposal}
      </option>
    );
  });

  const voteSteps = () => {
    if (oldWorkflowEvents.length == 0) {
      return "RegisteringVoters";
    }
    if (oldWorkflowEvents.length == 1) {
      return "ProposalsRegistrationStarted";
    } else if (oldWorkflowEvents.length == 2) {
      return "ProposalsRegistrationEnded";
    } else if (oldWorkflowEvents.length == 3) {
      return "VotingSessionStarted";
    } else if (oldWorkflowEvents.length == 4) {
      return "VotingSessionEnded";
    } else if (oldWorkflowEvents.length == 5) {
      return "VotingSessionEnded";
    }
  };

  const handleVoted = (event) => {
    setDropdownProp(event.target.value);
  };

  // getters 

  useEffect(() => {
  const getProposals = async () => {

  
    const proposalsEvents = await contract.getPastEvents("ProposalRegistered", {
      fromBlock: 0,
      toBlock: "latest",
    });
    const propsLength = proposalsEvents.length;
    const propsList = [];
    for (let i = 1; i < propsLength + 1; i++) {
      const proposalObj = await contract.methods
        .getOneProposal(i)
        .call({ from: accounts[0] });
      propsList.push(proposalObj[0]);
    }
    setProposals(propsList);
  };

  getProposals();
},[contract, accounts]);

  const getWfStatus = async () => {
    try {
      const currentWorkflow = await contract.methods.workflowStatus
        .call()
        .call();
      setWfArr(currentWorkflow);
    } catch (err) {
      setWfArr("");
    }
  };

  

  const getWiningProp = async () => {
    console.log("test0");

    const winningProposal = await contract.methods
      .winningProposalID()
      .call({ from: accounts[0] });
    console.log("test");
    //  await contract.methods.winningProposalId.send({from: accounts[0]}).call()
    setWinningProposal(`La proposition N°${winningProposal} a remporté le votewinningProposal`);
    console.log("test2");
  };
  console.log(winningProposal);
  const address = inputAddress; // ajout d'un votant
  const addVoter = async () => {
    if (!web3.utils.isAddress(inputAddress)) {
      alert("invalid address");
    }
    await contract.methods.addVoter(address).send({ from: accounts[0] });
  };
  const handleAddressInput = (e) => {
    e.preventDefault();
    writeInputAddress(e.target.value);
  };

  const proposal = voterProp;
  const addProposal = async () => {
    const voterProp = await contract.methods
      .addProposal(proposal)
      .send({ from: accounts[0] });
    setVoterProp(voterProp);
    
    
  };

  const setVote = async () => {
    await contract.methods.setVote(dropdownProp).send({ from: accounts[0] });
    setProposalVoted(proposalVoted);
  };
  console.log(proposalVoted);

  const startProposalsRegistering = async () => {
    await contract.methods
      .startProposalsRegistering()
      .send({ from: accounts[0] });
    getWfStatus();
  };
  const endProposalsRegistering = async () => {
    await contract.methods
      .endProposalsRegistering()
      .send({ from: accounts[0] });
    getWfStatus();
  };
  const startVotingSession = async () => {
    await contract.methods.startVotingSession().send({ from: accounts[0] });
    getWfStatus();
  };
  const endVotingSession = async () => {
    await contract.methods.endVotingSession().send({ from: accounts[0] });
    getWfStatus();
  };
  const tallyVotes = async () => {
    await contract.methods.tallyVotes().send({ from: accounts[0] });
    getWfStatus();
  };

  return contract && owner ? (
    <Grid.Container css={{ maxWidth: "800px" }} gap={2} justify="center">
      <Text css={{ margin: "5%" }} h1>
        Voting Dapp
      </Text>

      <Grid justify="center" xs={12}>
        <Text
          aria-label="tonadresse"
          h2
          css={{ margin: "10px", textAlign: "flexStart" }}
        >
          Connected Address
        </Text>

        <Card css={{ mw: "300px" }}>
          <Card.Body>
            <Text h3> Vottre adresse : {accounts[0]}</Text>
          </Card.Body>
        </Card>
      </Grid>

      <Grid justify="center" xs={12}>
        <Text h2> Etape du vote: {voteSteps()} </Text>
      </Grid>

      <Grid justify="center" md={6}>
        <Card css={{ width: "400px" }}>
          <Card.Header>
            <Text h2>Function add voter</Text>
          </Card.Header>
          <Card.Divider />
          <Card.Body css={{ py: "$10" }}>
            <Text h3 css={{ marginBottom: "10px" }}>
              Vous pouvez ajouter l'adresse d'un voteur ici
            </Text>
            <Input
              justify="center"
              css={{ maxWidth: "90%" }}
              type="text"
              placeholder="_add"
              value={inputAddress}
              onChange={handleAddressInput}
              aria-label="adresseVoter"
            />
          </Card.Body>
          <Card.Divider />
          <Card.Footer>
            <Row justify="center">
              <Button onClick={addVoter} size="sm" color="secondary">
                Add Voter address
              </Button>
            </Row>
          </Card.Footer>
        </Card>
      </Grid>

      <Grid justify="center" xs={12}>
        {owner}
      </Grid>
      <Grid justify="center" xs={12}></Grid>
      <Grid justify="center" xs={12}>
       
        <Button onClick={getWiningProp} size="sm" color="secondary">
          winning proposal
        </Button>
      </Grid>
      <Grid>
        {" "}
        <Text h2 css={{ marginBottom: "5px" }}>
          {" "}
          Derniere Adresse enregistrée : {eventAddr}
        </Text>
      </Grid>

      <Grid>
        {oldEventsAddr.map((element, index) => {
          return (
            <div key={index}>
              <Text h2 css={{ marginBottom: "5px" }}>
                Le Votant n° {index + 1} est enregistré
              </Text>
              <h2>{element}</h2>
            </div>
          );
        })}
      </Grid>
      <Grid xs={12}></Grid>
      <Grid sx={12}>
        <Button bordered onClick={startProposalsRegistering}>
          Start Proposal
        </Button>
        <Button bordered onClick={endProposalsRegistering}>
          End Proposal
        </Button>
        <Button bordered onClick={startVotingSession}>
          Start Voting session
        </Button>
        <Button bordered onClick={endVotingSession}>
          End Voting session
        </Button>
        <Button bordered onClick={tallyVotes}>
          Tally Votes
        </Button>
      </Grid>
    </Grid.Container>
  ) : (
    <Grid.Container css={{ maxWidth: "800px" }} gap={2} justify="center">
      <Text css={{ margin: "5%" }} h1>
        Voting Dapp
      </Text>

      <Grid justify="center" xs={12}>
        <Text
          aria-label="tonadresse"
          h2
          css={{ margin: "10px", textAlign: "flexStart" }}
        >
          Connected Address
        </Text>

        <Card css={{ mw: "300px" }}>
          <Card.Body>
            <Text h3> Vottre adresse : {accounts[0]}</Text>
          </Card.Body>
        </Card>
      </Grid>

      <Grid justify="center" xs={12}>
        <Text h2> {voteSteps()} </Text>
      </Grid>

      <Grid justify="center" md={6}>
        <Card css={{ width: "400px" }}>
          <Card.Header>
            <Text h2>Function Add Proposal</Text>
          </Card.Header>
          <Card.Divider />
          <Card.Body css={{ py: "$10" }}>
            <Text h3 css={{ marginBottom: "10px" }}>
              Vous pouvez effectuer une propositon de vote
            </Text>
            <Card.Body css={{ py: "$10" }}>
              <Input
                justify="center"
                css={{ maxWidth: "90%" }}
                type="text"
                placeholder="_add"
                value={voterProp}
                onChange={(e) => setVoterProp(e.target.value)}
                aria-label="proposition de vote"
              />
            </Card.Body>
          </Card.Body>
          <Card.Divider />
          <Card.Footer>
            <Row justify="center">
              <Row justify="center">
                <Button onClick={addProposal} size="sm" color="secondary">
                  Add Proposal
                </Button>
              </Row>
            </Row>
          </Card.Footer>
        </Card>
      </Grid>

      <Grid justify="center" md={6}>
        <Card css={{ width: "400px" }}>
          <Card.Header>
            <Text h2>Function Vote for proposal</Text>
          </Card.Header>
          <Card.Divider />
          <Card.Body css={{ py: "$10" }}>
            <Text h3 css={{ marginBottom: "10px" }}>
              Vous pouvez voter pour une proposition
            </Text>
            <div>
              <select value={dropdownProp} onChange={handleVoted}>
                {options}
              </select>
              <h3>You choose {dropdownProp}</h3>
            </div>
            <Card.Body css={{ py: "$10" }}>{proposalVoted}</Card.Body>
          </Card.Body>
          <Card.Divider />
          <Card.Footer>
            <Row justify="center">
              <Row justify="center">
                <Button onClick={setVote} size="sm" color="secondary">
                  Vote
                </Button>
              </Row>
            </Row>
          </Card.Footer>
        </Card>
      </Grid>

      <Grid justify="center" xs={12}>
        <Proposals />
      </Grid>
      <Grid justify="center" xs={12}>
        <Button onClick={getWfStatus} size="sm" color="secondary">
          getWFstatus
        </Button>
      </Grid>
      <Grid justify="center" xs={12}></Grid>
      <Button onClick={getWiningProp} size="sm" color="secondary">
        winning proposal
      </Button>
      <Grid justify="center" xs={12}>
        {" "}
        <Text h2> 
         
          {winningProposal} 
     
        </Text>{" "}
      </Grid>
      <Grid>
        {oldEventsAddr.map((element, index) => {
          return (
            <div key={index}>
              <Text h2 css={{ marginBottom: "5px" }}>
                Voter n {index} is Registered
              </Text>
              <h2>{element}</h2>
            </div>
          );
        })}
      </Grid>
      <Grid xs={12}> </Grid>
    </Grid.Container>
  );
}

export default Vote;
