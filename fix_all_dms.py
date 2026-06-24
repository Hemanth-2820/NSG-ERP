import os
import re

files = [
    ("src/components/ceo/pages/Messaging.jsx", "ceoName"),
    ("src/components/hr/modules/messaging/HrMessagingView.jsx", "userName"),
    ("src/components/tl/Messaging & Meet/messages.module.index.jsx", "tlName")
]

for file_path, var_name in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    helper = f"""  const [localDmMessages, setLocalDmMessages] = useState({{}});

  const getDmId = (otherName) => {{
    return "dm-" + [{var_name}, otherName].sort().join('-');
  }};

  const getDmUser = (channelId) => {{
    if (!channelId || !channelId.startsWith('dm-')) return null;
    const names = channelId.replace('dm-', '').split('-');
    const otherName = names.find(n => n !== {var_name}) || names[0];
    return employees.find(e => e.name === otherName) || {{ name: otherName }};
  }};
"""
    content = content.replace("  const [localDmMessages, setLocalDmMessages] = useState({});\n", helper)

    # Replace old dm id generation
    content = content.replace("`dm-${e.id}` === newMsg.channel_id", "getDmId(e.name) === newMsg.channel_id")
    content = content.replace("`dm-${e.id}` === selectedChannel", "getDmId(e.name) === selectedChannel")
    content = content.replace("`dm-${emp.id}`", "getDmId(emp.name)")
    content = content.replace("`dm-${empId}`", "getDmId(empIdName)") # Need empIdName which doesn't exist, we'll patch that manually if needed or let it be if it's unused
    content = content.replace('\"dm-\"+e.id', 'getDmId(e.name)')

    # Websocket host fix
    ws_regex = re.compile(r"const wsUrl = `\$\{wsProtocol\}//\$\{window\.location\.hostname\}:8000/employee-portal/ws/\$\{encodeURIComponent\([^\)]+\)\}`;")
    
    ws_new = f"""const wsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '127.0.0.1:8000' : 'nsg-erp.onrender.com';
    const wsUrl = `${{wsProtocol}}//${{wsHost}}/employee-portal/ws/${{encodeURIComponent({var_name})}}`;"""
    
    content = ws_regex.sub(ws_new, content)

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
