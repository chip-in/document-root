import sectionsToTable from "@ops-frontier/sections-to-table";
import type { SectionsToTableOptions } from "@ops-frontier/sections-to-table";


const plugin = (_) => {
    const options: SectionsToTableOptions = {
        thirdColumnFromHeading: true,
        columnNames: ["ID", "要件", "状態", "テスト手順など"],
        tableClassName: "test-spec",
        thirdColumnClassName: {
            "仕様待ち": "waiting",
            "実装待ち": "need-implement",
            "未テスト": "need-test",
            "テスト不要": "no-test",
            "実装不要": "no-implement",
            "OK": "ok",
            "NG": "ng",
        }
    }

    return sectionsToTable.call(this, options);
}

export default plugin;