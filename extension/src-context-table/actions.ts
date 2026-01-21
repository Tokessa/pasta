/* eslint-disable @typescript-eslint/no-namespace */
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

import { ContextTableControlAction, ContextTableData } from "./utils-classes";

interface Action {
    kind: string;
}

/** Adds a row to the table. */
export interface SendContextTableDataAction extends Action {
    kind: typeof SendContextTableDataAction.KIND;
    data: ContextTableData;
}

export namespace SendContextTableDataAction {
    export const KIND = "sendContextTableData";

    export function create(data: ContextTableData): SendContextTableDataAction {
        return {
            kind: SendContextTableDataAction.KIND,
            data,
        };
    }

    export function isThisAction(action: Action): action is SendContextTableDataAction {
        return action.kind === SendContextTableDataAction.KIND;
    }
}

/** Message to the language server to add a rule to the currently open file. */
export interface AddRuleAction extends Action {
    kind: typeof AddRuleAction.KIND;
    ruleText: string;
    contextText: string;
    type: string;
    controlAction:ContextTableControlAction;
}

export namespace AddRuleAction {
    export const KIND = "addRule";

    export function create(ruleText: string, contextText: string, type: string, controlAction: ContextTableControlAction): AddRuleAction {
        return {
            kind: KIND,
            ruleText: ruleText,
            contextText: contextText,
            type,
            controlAction
        };
    }

    export function isThisAction(action: Action): action is AddRuleAction {
        return action.kind === AddRuleAction.KIND;
    }
}