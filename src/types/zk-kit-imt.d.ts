// @zk-kit/incremental-merkle-tree ships types its package.json "exports" does not expose
declare module "@zk-kit/incremental-merkle-tree" {
  export class IncrementalMerkleTree {
    constructor(hash: (values: bigint[]) => bigint, depth: number, zeroValue: bigint, arity?: number);
    readonly root: bigint;
    readonly leaves: bigint[];
    insert(leaf: bigint): void;
    createProof(index: number): { root: bigint; leaf: bigint; siblings: bigint[][]; pathIndices: number[] };
  }
}
