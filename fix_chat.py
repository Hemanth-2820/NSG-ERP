import re
import os

files = [
    r"c:\Users\DELL\Desktop\NSG-ERP\src\components\employee\Messaging.jsx",
    r"c:\Users\DELL\Desktop\NSG-ERP\src\components\ceo\pages\Messaging.jsx",
    r"c:\Users\DELL\Desktop\NSG-ERP\src\components\hr\modules\messaging\HrMessagingView.jsx",
    r"c:\Users\DELL\Desktop\NSG-ERP\src\components\tl\Messaging & Meet\messages.module.index.jsx"
]

def fix_file(filepath):
    print(f"Processing {filepath}")
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine user name variable based on file
    user_var = "empName"
    if "ceo" in filepath.lower():
        user_var = "ceoName"
    elif "hr" in filepath.lower():
        user_var = "hrName"
    elif "tl" in filepath.lower():
        user_var = "tlName"

    # 1. Replace `messages = useMemo`
    memo_pattern = r'const messages = useMemo\(\(\) => \{[\s\S]*?\}, \[[^\]]+\]\);'
    new_memo = f"""const messages = useMemo(() => {{
    const allMsgs = {{ ...localDmMessages }};
    chatChannels.forEach(c => {{
      allMsgs[c.id] = c.messages || [];
    }});
    return allMsgs;
  }}, [chatChannels, localDmMessages]);"""
    
    content = re.sub(memo_pattern, new_memo, content)

    # 2. Replace `getUnreadCount`
    unread_pattern = r'const getUnreadCount = \(channelId\) => \{[\s\S]*?^\s*};\n'
    new_unread = f"""const getUnreadCount = (channelId) => {{
    const msgs = messages[channelId] || [];
    return msgs.filter(m => {{
       if (m.isMe || m.sender === {user_var} || (m.sender && m.sender.includes('Employee'))) return false;
       let seenArr = [];
       try {{ if (m.seen_by) seenArr = JSON.parse(m.seen_by); }} catch(e) {{}}
       if (!Array.isArray(seenArr)) seenArr = [];
       return !seenArr.includes({user_var});
    }}).length;
  }};
"""
    content = re.sub(unread_pattern, new_unread, content, flags=re.MULTILINE)

    # 3. Replace catch blocks in useEffect
    # We want to find the seenArr parse blocks
    seen_block_pattern = r'try \{\s*let seenArr = m\.seen_by \? JSON\.parse\(m\.seen_by\) : \[\];\s*if \(!seenArr\.includes\((.*?)\)\) \{\s*seenArr\.push\(\1\);\s*return \{ \.\.\.m, seen_by: JSON\.stringify\(seenArr\) \};\s*\}\s*\} catch\(e\) \{\}'
    
    new_seen_block = f"""try {{
                  let seenArr = m.seen_by ? JSON.parse(m.seen_by) : [];
                  if (!Array.isArray(seenArr)) seenArr = [];
                  if (!seenArr.includes({user_var})) {{
                    seenArr.push({user_var});
                    return {{ ...m, seen_by: JSON.stringify(seenArr) }};
                  }}
                }} catch(e) {{
                  return {{ ...m, seen_by: JSON.stringify([{user_var}]) }};
                }}"""
    
    content = re.sub(seen_block_pattern, new_seen_block, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")

for f in files:
    fix_file(f)
