interface AdminTabsProps {
    tabs: {
        id: string;
        label: string;
    }[];
    activeTab: string;
    onChange: (id: any) => void;
}

export default function AdminTabs({ tabs, activeTab, onChange }: AdminTabsProps) {
    return (
        <div className="overflow-x-auto mb-4 border-bottom pb-2">
            <ul className="nav nav-pills flex-row flex-nowrap align-items-center gap-2" style={{ minWidth: "max-content" }}>
                {tabs.map((tab) => (
                    <li key={tab.id} className="nav-item">
                        <button
                            className={`nav-link ${activeTab === tab.id ? "active fw-bold shadow-sm" : "text-muted border-0 bg-transparent"}`}
                            onClick={() => onChange(tab.id)}
                            type="button"
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
