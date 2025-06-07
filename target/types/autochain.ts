export type Autochain = {
  "version": "0.1.0",
  "name": "autochain",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateMetadata",
      "accounts": [
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "temp",
          "type": "u64"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "proof",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "nftAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "temp",
            "type": "u64"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "lastUpdate",
            "type": "i64"
          },
          {
            "name": "imageUrl",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidProof",
      "msg": "Invalid ZK proof"
    }
  ]
};

export const IDL: Autochain = {
  "version": "0.1.0",
  "name": "autochain",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateMetadata",
      "accounts": [
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "temp",
          "type": "u64"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "proof",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "nftAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "temp",
            "type": "u64"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "lastUpdate",
            "type": "i64"
          },
          {
            "name": "imageUrl",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidProof",
      "msg": "Invalid ZK proof"
    }
  ]
};
