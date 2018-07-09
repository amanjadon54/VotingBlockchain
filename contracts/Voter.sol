pragma solidity ^0.4.0;

contract Voter {

    address chairperson;
    mapping(address => bool) public voterMap;
    
    struct Candidate{
        uint candidateId;
        string candidateName;
        uint8 candidateVotes;
    }
    
    // string public candidate;
    mapping(uint => Candidate) public candidates;
    
    uint public candidatesCount;
    
    constructor() public {
        // candidate = "Aman";
        populateCandidates("Narender Modi");
        populateCandidates("Rahul Gandhi");
        populateCandidates("Rampur Maniharan");
    }
    
    // voted event
    // event votedEvent (
    //     uint indexed _candidateId
    // );
    //populate candidateList

    event votedEvent (
        uint indexed _candidateId
    );

    function populateCandidates(string name) public{
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, name, 0);
    }

    //function for voting
    function provideVotes(uint candidateId) public{
        if(voterMap[msg.sender]==false)
        {
            candidates[candidateId].candidateVotes++;
            voterMap[msg.sender] = true;
        }
        votedEvent(candidateId);
    }
}