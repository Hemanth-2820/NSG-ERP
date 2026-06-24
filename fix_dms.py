import os
import re

file_path = "src/components/employee/Messaging.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add getDmId helper
helper = """  const [localDmMessages, setLocalDmMessages] = useState({});

  const getDmId = (otherName) => {
    return "dm-" + [empName, otherName].sort().join('-');
  };

  const getDmUser = (channelId) => {
    if (!channelId || !channelId.startsWith('dm-')) return null;
    const names = channelId.replace('dm-', '').split('-');
    const otherName = names.find(n => n !== empName) || names[0];
    return employees.find(e => e.name === otherName) || { name: otherName };
  };
"""
content = content.replace("  const [localDmMessages, setLocalDmMessages] = useState({});\n", helper)

# Replace all logic occurrences of `dm-${e.id}`
content = content.replace("`dm-${e.id}` === newMsg.channel_id", "getDmId(e.name) === newMsg.channel_id")
content = content.replace("`dm-${e.id}` === selectedChannel", "getDmId(e.name) === selectedChannel")
content = content.replace("`dm-${emp.id}`", "getDmId(emp.name)")
content = content.replace("`dm-${empId}`", "getDmId(empIdName)") # we need to fix the empIdName!
content = content.replace('\"dm-\"+e.id', 'getDmId(e.name)')

# Websocket host fix
ws_old = "const wsUrl = `${wsProtocol}//127.0.0.1:8000/employee-portal/ws/${encodeURIComponent(empName)}`;"
ws_new = """const wsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '127.0.0.1:8000' : 'nsg-erp.onrender.com';
    const wsUrl = `${wsProtocol}//${wsHost}/employee-portal/ws/${encodeURIComponent(empName)}`;"""
content = content.replace(ws_old, ws_new)

# Find and remove simulated reply
start_idx = content.find("    // Simulated reply")
if start_idx != -1:
    # Find the end of this block which is the end of handleSendMessage
    end_idx = content.find("  };\n\n\n\n  // Start Call WebRTC")
    if end_idx != -1:
        content = content[:start_idx] + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
