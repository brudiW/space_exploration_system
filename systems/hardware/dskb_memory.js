import fs from 'fs'

export class DisplayKeyboardInterface {
    constructor() {
        this.keyMap = [
            ['FAULT SUM', 'SYS SUMM', 'MSG RESET', 'ACK'],
            ['GPC/CRT', 'A', 'B', 'C'],
            ['I/O RESET', 'D', 'E', 'F'],
            ['ITEM', '1', '2', '3'],
            ['EXEC', '4', '5', '6'],
            ['OPS', '7', '8', '9'],
            ['SPEC', '-', '0', '+'],
            ['RESUME', 'CLEAR', '.', 'PRO']
        ];
        this.inputString = '';
        this.parser = new DSKB_Parser();
    }
    press(button = [0, 0]) {
        const row = this.keyMap[button[0]];
        if (!row || !row[button[1]]) return;

        this.inputString += row[button[1]] + '\n';
    }
    parse() {
        let parseArray = this.inputString.split("\n");
        this.parser.parse(parseArray);
    }
}
export class DSKB_Parser {
    constructor() {
        this.keyWords = ['ACK', 'GPC/CRT', 'ITEM', 'OPS', 'SPEC', 'PRO'];
        this.actionWords = ['EXEC', 'RESUME', 'CLEAR', '-', '+', 'I/O RESET'];
        this.lastKeyWord = '';
        this.section = '';
        this.value = '';
    }
    parse(parseArray) {
        for (let i = 0; i < parseArray.length; i++) {
            if (!parseArray[i]) continue;
            if (this.keyWords.includes(parseArray[i])) {
                switch (this.lastKeyWord) {
                    case "ITEM":
                        OV.memory.selectItem(this.value);
                        break;
                    case "SPEC":
                        OV.memory.selectSpec(this.value);
                        break;
                    case "OPS":
                        break;
                    case "PRO":
                        break;
                    case "ACK":
                        break;
                    case "GPC/CRT":
                        break;
                    default:
                        break;
                }
                this.section = ''
                this.section += parseArray[i];
                this.lastKeyWord = parseArray[i];
            } else if (this.actionWords.includes(parseArray[i])) {
                switch (parseArray[i]) {
                    case "EXEC":
                        if (OV.memory.get().type == "exec") {
                            OV.computers.programHandler.exec(OV.memory.get().val, OV.computers.gpc4);
                        }
                        break;
                    case "RESUME":
                        if (OV.memory.get().perm === "r/w" || OV.memory.get().perm === "w") {
                            OV.memory.set(this.value);
                        }
                        break;
                    case "CLEAR":
                        if (OV.memory.get().perm === "r/w" || OV.memory.get().perm === "w") {
                            OV.memory.set("0");
                        }
                        break;
                    case "-":
                        if (OV.memory.get().perm === "r/w" || OV.memory.get().perm === "w") {
                            OV.memory.sub();
                        }
                        break;
                    case "+":
                        if (OV.memory.get().perm === "r/w" || OV.memory.get().perm === "w") {
                            OV.memory.add();
                        }
                        break;
                    case "I/O RESET":
                        break;
                }
            } else {
                if (this.lastKeyWord == "SPEC") {
                    if (this.value.length == 2) {
                        OV.memory.selectSpec(this.value);
                        this.value = '';
                        this.section = '';
                    }
                }
                this.value += parseArray[i];
                this.section += parseArray[i];
            }
        }
    }
}

export class DynamicMemory {
    constructor() {
        this.memory = {};
        this.selection = ["0", "0"];
        this.loadMemory();
    }
    async loadMemory() {
        const jsonData = fs.readFileSync('../libraries/memory.json');
        const jsonval = JSON.parse(jsonData);
        this.memory = jsonval;
    }
    async writeMemory() {
        const jsonData = JSON.stringify(this.memory);
        fs.writeFileSync("../libraries/memory.json", jsonData);
    }
    selectItem(item) {
        this.selection[0] = item;
    }
    selectSpec(spec) {
        this.selection[1] = spec;
    }
    get() {
        const item = this.memory[this.selection[0]];
        if (!item) return null;

        const spec = item[this.selection[1]];
        if (!spec) return null;

        return spec;
    }
    set(value) {
        this.memory[this.selection[0]][this.selection[1]].val = value;
        this.writeMemory();
    }
    add() {
        if (this.get().perm === "r/w" || this.get().perm === "w") {
            if (this.get().type == "bool") {
                if (this.get().val == "0") {
                    this.set("1");
                } else {
                    this.set("0");
                }
            } else if (this.get().type == "number") {
                let val = parseInt(this.get().val);
                this.set((val + 1).toString());
            } else if (this.get().type == "float") {
                let val = parseFloat(this.get().val);
                this.set((val + 1).toString());
            }
        }
    }
    sub() {
        if (this.get().perm === "r/w" || this.get().perm === "w") {
            if (this.get().type == "bool") {
                if (this.get().val == "0") {
                    this.set("1");
                } else {
                    this.set("0");
                }
            } else if (this.get().type == "number") {
                let val = parseInt(this.get().val);
                this.set((val - 1).toString());
            } else if (this.get().type == "float") {
                let val = parseFloat(this.get().val);
                this.set((val - 1).toString());
            }
        }
    }
}
