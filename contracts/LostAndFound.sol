// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LostAndFound {
    struct Item {
        address owner;
        string description;
        string location;
        uint256 reward;
        bool isFound;
        address finder;
    }

    uint256 public registrationFee = 0.001 ether;
    uint256 public claimFee = 0.0005 ether;
    
    mapping(uint256 => Item) public items;
    uint256 public itemCount;

    event ItemRegistered(uint256 indexed itemId, address owner, string description);
    event ItemFound(uint256 indexed itemId, address finder);
    event ItemClaimed(uint256 indexed itemId, address owner, address finder);

    modifier onlyItemOwner(uint256 _itemId) {
        require(msg.sender == items[_itemId].owner, "Not the item owner");
        _;
    }

    function registerItem(string memory _description, string memory _location, uint256 _reward) public payable {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        
        itemCount++;
        items[itemCount] = Item({
            owner: msg.sender,
            description: _description,
            location: _location,
            reward: _reward,
            isFound: false,
            finder: address(0)
        });

        emit ItemRegistered(itemCount, msg.sender, _description);
    }

    function reportFound(uint256 _itemId) public payable {
        require(_itemId <= itemCount, "Item does not exist");
        require(!items[_itemId].isFound, "Item already found");
        require(msg.value >= claimFee, "Insufficient claim fee");

        Item storage item = items[_itemId];
        item.isFound = true;
        item.finder = msg.sender;

        emit ItemFound(_itemId, msg.sender);
    }

    function claimReward(uint256 _itemId) public onlyItemOwner(_itemId) {
        Item storage item = items[_itemId];
        require(item.isFound, "Item not found yet");
        require(item.finder != address(0), "No finder registered");
        
        payable(item.finder).transfer(item.reward);
        emit ItemClaimed(_itemId, msg.sender, item.finder);
    }

    function getItem(uint256 _itemId) public view returns (
        address owner,
        string memory description,
        string memory location,
        uint256 reward,
        bool isFound,
        address finder
    ) {
        Item storage item = items[_itemId];
        return (
            item.owner,
            item.description,
            item.location,
            item.reward,
            item.isFound,
            item.finder
        );
    }
}
