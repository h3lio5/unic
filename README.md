# Unic

Proof of humanity is essential to confirm that a human, rather than a bot or automated system, is responsible for a particular action. This helps prevent fraud, abuse, and other malicious activities that can be carried out by non-human entities. However, some current approaches require users to divulge more information publicly than necessary. For example, proof of humanity asks users to upload their video, which can be seen by anyone.

## Introducing Unic

Unic is a decentralized identity platform that seamlessly associates a human identity with a blockchain address without revealing any sensitive information. Unic addresses several critical challenges faced by traditional identity systems and existing blockchain-based identity solutions.

## Key Advantages:

Mitigation of Sybil Attacks: Unic employs ZKML to do off-chain authentication of human face and posts the proof on-chain for verification. The method ensures a human identity behind an address through cryptographic security. Sybil attacks occur when a single user creates multiple identities to manipulate or exploit a system. By linking each human identity to a unique blockchain address, Unic ensures that one person is represented by only one verifiable identity, safeguarding the integrity of the platform.
Soul Bound Tokens: These tokens are intricately linked to a verified human identity and cannot be transferred to another individual. They can only be transferred to another address linked to the same human identity. This unique feature opens up new possibilities in features like GitPOAP which can allow the current non-transferrable credential to be transferable between addresses linked to same human identity.
Decentralized KYC (Know Your Customer): One of the most significant advantages of Unic is its ability to facilitate decentralized KYC processes. Traditional KYC methods often involve sharing sensitive personal information with centralized authorities, raising concerns about data privacy and security.
Privacy-Centric Authentication: Unlike existing solutions that might compromise user privacy by requesting authentication videos or other intrusive data, Unic focuses on privacy-centric authentication methods. The platform employs ZK protocols to validate human identity without compromising sensitive information. This ensures that users have peace of mind knowing that their data remains secure and protected.
## How it's Made
To establish a universal proof of human identity, users need to authenticate themselves with their face. However, running Machine Learning models for facial classification on-chain is too expensive due to gas constraints. As a solution, we perform the computation intensive inference off-chain by leveraging the HyperOracle's infrastructure and solution. We trust the computation because HyperOracle verifies that any computation was done correctly using Zero-Knowledge Proofs (ZKPs). Moreover, we save gas by offloading inference computation off-chain to oracles.
For the face-based authentication system, the machine learning model we use for inference comprises two components. The first is a server that produces facial embeddings from an image. The second component is a classifier that uses these embeddings to distinguish between human identities.
Once the user is verified, they can associate an address with their identity.
