import useEth from "../../contexts/EthContext/useEth"
import { Card, Text } from "@nextui-org/react"
import { useEffect,  useState } from "react"

function Proposals() {

    const { state: { contract, accounts } } = useEth()
    const [proposals, setProposals] = useState([])

    const fetchProposals = async () => {
        if (!contract || !accounts) {
            return
        }
        const proposalsEvents = await contract.getPastEvents("ProposalRegistered",
            {
                fromBlock: 0,
                toBlock: "latest"
            })
        const propsLength = proposalsEvents.length
        const propsList = []
        for (let i = 1 ; i < propsLength+1 ; i ++){
            const proposalObj = await contract.methods.getOneProposal(i).call({from : accounts[0]})
            propsList.push(proposalObj[0])
        }
        setProposals(propsList)
    }

    useEffect(() => {
        fetchProposals()
    }, [])

    return (
        <Card css={{ width: "400px" }}>
            <Card.Body css={{ p: "$10" }}>
            <Text h2 > Liste of Proposals</Text> 
            
                {proposals.map((propal, index) => (
                    <Text h3 css={{marginTop: "10px"}} > {`${index + 1} : ${propal}`} </Text>
                ))}
            
            </Card.Body>
        </Card>
    )
}

export default Proposals