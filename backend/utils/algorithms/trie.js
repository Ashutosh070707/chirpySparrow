class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.userData = null; // Store additional data for the user
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(username, userData) {
    let node = this.root;
    for (const char of username.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.userData = userData; // Store the additional data here
  }

  searchPrefix(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this.collectAllWords(node);
  }

  collectAllWords(node, results = []) {
    if (node.isEndOfWord) {
      results.push(node.userData); // Collect the user data here
    }
    for (const char in node.children) {
      this.collectAllWords(node.children[char], results);
    }
    return results;
  }
}

export const trie = new Trie();
