import { describe, expect, it } from "vitest"
import { edge, node } from "./graphFixtures.js"
import { validateGraph } from "../../helpers/validateGraph.js"

describe("validateGraph", () => {
    it("accepts a graph where two paths reach the same node", () => {
        const nodes = [node("A", "trigger"), node("B"), node("C")]
        const edges = [edge("A", "B"), edge("B", "C"), edge("A", "C")]
        expect(() => validateGraph(nodes, edges)).not.toThrow()
    })

    it("rejects a cycle", () => {
        const nodes = [node("A", "trigger"), node("B"), node("C")]
        const edges = [edge("A", "B"), edge("B", "C"), edge("C", "A")]

        expect(() => validateGraph(nodes, edges)).toThrow(expect.objectContaining({ status: 400 }))
    })
    it("rejects an edge pointing to a node that doesnt exist", () => {
        const nodes = [node("A", "trigger"), node("B")]
        const edges = [edge("A", "B"), edge("B", "C")]

        expect(() => validateGraph(nodes, edges)).toThrow(expect.objectContaining({ status: 400 }))
    })
    it("rejects a graph with no trigger", () => {
        const nodes = [node("A"), node("B"), node("C")]
        const edges = [edge("A", "B"), edge("B", "C"), edge("A", "C")]

        expect(() => validateGraph(nodes, edges)).toThrow(expect.objectContaining({ status: 400 }))
    })

    it("rejects a graph with two triggers", () => {
        const nodes = [node("A", "trigger"), node("B", "trigger"), node("C")]
        const edges = [edge("A", "B"), edge("B", "C"), edge("A", "C")]

        expect(() => validateGraph(nodes, edges)).toThrow(expect.objectContaining({ status: 400 }))
    })
})