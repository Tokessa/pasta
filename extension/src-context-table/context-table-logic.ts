/*
 * KIELER - Kiel Integrated Environment for Layout Eclipse RichClient
 *
 * http://rtsys.informatik.uni-kiel.de/kieler
 *
 * Copyright 2022 by
 * + Kiel University
 *   + Department of Computer Science
 *     + Real-Time and Embedded Systems Group
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { getColumnIndexForRule } from "./utils";
import { ContextTableRule, ContextTableVariable, Type, ContextCell } from "./utils-classes";

/**
/**
 * Determines the used rules of {@code rules} and for which column they apply.
 * @param variables The variable values of the current row.
 * @param rules The available rules.
 * @param selectedController The currently selected controller.
 * @param selectedAction The currently selected control action.
 * @param selectedType The currently selected control action type.
 * @returns the used rules, whereby the index determines the column they apply to.
 */
export function determineUsedRules(
    variables: ContextTableVariable[],
    rules: ContextTableRule[],
    selectedController: string,
    selectedAction: string,
    selectedType: number
): ContextTableRule[][] {
    // keeps track of the used rules, whereby the index determines the column
    // Initialize array based on selectedType
    const numColumns = selectedType === Type.NOT_PROVIDED ? 1 
                    : selectedType === Type.PROVIDED ? 3 
                    : 4; 

    const usedRules: ContextTableRule[][] = Array.from({ length: numColumns }, () => []);

    // Determine the used rules
    rules.forEach(rule => {
        // Compare control action of the rule with the selected one and
        // the context of the rule with the current context
        if (
            rule.controlAction.controller === selectedController &&
            rule.controlAction.action === selectedAction &&
            checkValues(rule.variables, variables)
        ) {
            // Get the column index for this rule
            const columnIndex = getColumnIndexForRule(rule, selectedType);
            if (columnIndex !== null && columnIndex < usedRules.length) {
                usedRules[columnIndex].push(rule);
            }
        }
    });

    return usedRules;
}

/**
 * Creates the result cells.
 * NOTE: changed to always create one cell per logical column (colSpan = 1). For contiguous
 * empty columns we output "No" only in the first of the contiguous run and an empty cell for
 * the following columns. Visual merging is done via CSS (see main.css).
 * @param results The hazards and rules for the result columns.
 * @returns The cells for the "Hazardous?"-column.
 */
export function createResults(results: { hazards: string[]; rules: ContextTableRule[] }[]): ContextCell[] {
    const cells: ContextCell[] = [];
    // go through all of the hazardous columns
    // First, discover contiguous runs of empty columns (rules.length === 0)
    const len = results.length;
    let i = 0;
    while (i < len) {
        if (results[i].rules.length !== 0) {
            // non-empty -> normal result cell
            const ucas = results[i].rules.map(rule => rule.id);
            cells.push({
                cssClass: "result",
                value: ucas.toString(),
                colSpan: 1,
                title: results[i].hazards.toString()
            });
            i++;
        } else {
            // start of an empty run
            let j = i + 1;
            while (j < len && results[j].rules.length === 0) {j++;}
            const runLength = j - i;
            // create runId and populate runLength cells with metadata
            for (let k = 0; k < runLength; k++) {
                const posClass = runLength === 1 ? 'result-no-start-end' : ((k === 0) ? "result-no-start" : ((k === runLength - 1) ? 'result-no-end' : 'result-no-mid'));
                cells.push({
                    cssClass: posClass,
                    value: '',
                    colSpan: 1
                });
            }
            i = j;
        }
    }
    return cells;
}

/**
 * Creates the result cells.
 * @param results The hazards and rules for the result columns.
 * @returns The cells for the "Hazardous?"-column.
 */
export function createResultsold(results: { hazards: string[]; rules: ContextTableRule[] }[]): ContextCell[] {
    const cells: ContextCell[] = [];
    // keeps track on how many neihbouring columns have no rule applied
    let noAppliedRuleCounter: number = 0;
    // go through all of the hazardous columns
    for (let hazardColumn = 0; hazardColumn < results.length; hazardColumn++) {
        if (results[hazardColumn].rules.length === 0) {
            // there is no rule for this column
            noAppliedRuleCounter++;
            if (hazardColumn + 1 === results.length) {
                // its the last column so we can fill the missing columns with a cell containing the value "No"
                cells.push({ cssClass: "result", value: "No", colSpan: noAppliedRuleCounter});
            }
        } else {
            // it may be that previous columns had no rule
            // in this case a cell with value "No" must be created that covers these columns
            if (noAppliedRuleCounter !== 0) {
                cells.push({ cssClass: "result", value: "No", colSpan: noAppliedRuleCounter});
                noAppliedRuleCounter = 0;
            }
            const ucas = results[hazardColumn].rules.map(rule => rule.id);
            // add the hazards, defined by the rule, as a cell
            cells.push({
                cssClass: "result",
                value: ucas.toString(),
                colSpan: 1,
                title: results[hazardColumn].hazards.toString()
            });
        }
    }
    return cells;
}

/**
 * Checks whether the values of {@code variables1} and {@code variables2} are the same
 * @param variables1 Variables that should be compared to the other set.
 * @param variables2 Variables that should be compared to the other set.
 * @returns true if all values are equal; false otherwise.
 */
function checkValues(variables1: ContextTableVariable[], variables2: ContextTableVariable[]): boolean {
    for (let i = 0; i < variables1.length; i++) {
        const firstVariable = variables1[i];
        // get corresponding variable
        const correspondingVariable = variables2.find(secondVariable => secondVariable.name === firstVariable.name);
        // check values
        if (firstVariable.value !== correspondingVariable?.value) {
            return false;
        }
    }
    return true;
}
