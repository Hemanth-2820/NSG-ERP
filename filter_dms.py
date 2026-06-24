import os

files = [
    ("src/components/ceo/pages/Messaging.jsx", "ceoName"),
    ("src/components/hr/modules/messaging/HrMessagingView.jsx", "userName"),
    ("src/components/tl/Messaging & Meet/messages.module.index.jsx", "tlName")
]

for file_path, var_name in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the messages map loop
    old_code1 = "(messages[selectedChannel] || []).filter(m => !m.parent_id).map((msg, idx) => {"
    new_code1 = f"""(messages[selectedChannel] || []).filter(m => {{
              if (m.parent_id) return false;
              if (selectedChannel.startsWith('dm-')) {{
                const targetUser = getDmUser(selectedChannel)?.name;
                return m.sender === {var_name} || m.sender === targetUser || m.sender === {var_name} + ' (TL)' || m.sender === targetUser + ' (TL)' || m.sender === 'System';
              }}
              return true;
            }}).map((msg, idx) => {{"""
            
    old_code2 = "{pinnedMsgs.map(pm => ("
    new_code2 = f"""{{pinnedMsgs.filter(m => {{
                      if (selectedChannel.startsWith('dm-')) {{
                        const targetUser = getDmUser(selectedChannel)?.name;
                        return m.sender === {var_name} || m.sender === targetUser || m.sender === {var_name} + ' (TL)' || m.sender === targetUser + ' (TL)' || m.sender === 'System';
                      }}
                      return true;
                    }}).map(pm => ("""

    content = content.replace(old_code1, new_code1)
    content = content.replace(old_code2, new_code2)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Applied leak filters to CEO, HR, and TL portals.")
