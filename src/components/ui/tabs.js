export const Tabs = ({ children }) => <div>{children}</div>;
export const TabsContent = ({ children, value }) => <div>{children}</div>;
export const TabsList = ({ children }) => <div className="flex mb-4">{children}</div>;
export const TabsTrigger = ({ children, value }) => <button className="px-4 py-2 mr-2 bg-gray-200 rounded">{children}</button>;