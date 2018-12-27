

module.exports = function examineScript() {
    const code = `
        @request
            function where(customer)
                return customer.ID < 3
            end
            set = "firstTwoCustomers"
        @do
            return firstTwoCustomers
    `;
    let meta_key = /^\s*@(\w+)\s*$/gim;
    const matches = meta_key.test(code);
    meta_key = /^\s*@(\w+)\s*$/gim;
    const scriptBlocks = [];
    if (matches) {
        let match = null;
        const meta_positions = [];
        while ((match = meta_key.exec(code)) !== null) {
            meta_positions.push({ index: match.index, match: match[1], commandLength: match[0].length });

        }
        meta_positions.push(null);
        meta_positions.forEach((position, index) => {
            if (position === null) return;
            const nextEntry = meta_positions[index + 1];
            const nextPosition = nextEntry !== null ? nextEntry.index : code.length;
            scriptBlocks.push(
                { command: position.match, text: code.slice(position.index + position.commandLength, nextPosition) }
            );
        });
        console.log({ scriptBlocks });
    } else {
        console.error("At least one @request or @do command must be executed");
    }
}