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

    # Replace mark_read effect
    mark_read_pattern = r"if\s*\(socketRef\.current\s*&&\s*socketRef\.current\.readyState\s*===\s*WebSocket\.OPEN\)\s*\{\s*socketRef\.current\.send\(JSON\.stringify\(\{\s*type:\s*'mark_read'[^}]*\}\)\);\s*\}"
    
    new_mark_read = f"""if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {{
        const unreadMsgs = (messages[selectedChannel] || []).filter(m => {{
            if (m.isMe || m.sender === {user_var} || (m.sender && m.sender.includes('Employee'))) return false;
            let seenArr = [];
            try {{ if (m.seen_by) seenArr = JSON.parse(m.seen_by); }} catch(e) {{}}
            if (!Array.isArray(seenArr)) seenArr = [];
            return !seenArr.includes({user_var});
        }});
        unreadMsgs.forEach(m => {{
            socketRef.current.send(JSON.stringify({{ type: 'read', msg_id: m.id }}));
        }});
      }}"""
    
    content = re.sub(mark_read_pattern, new_mark_read, content)

    # Replace HuddleModal onClose
    huddle_pattern = r'<HuddleModal\s*peer=\{huddlePeer\}\s*onClose=\{\(\)\s*=>\s*setHuddlePeer\(null\)\}\s*/>'
    
    new_huddle = f"""<HuddleModal 
          peer={{huddlePeer}} 
          onClose={{async () => {{
             try {{
                const msgs = messages[huddlePeer.channelId] || [];
                const lastCallMsg = msgs.slice().reverse().find(m => m.isCallStatus || m.text === 'Started a video call');
                if (lastCallMsg && lastCallMsg.text !== 'Video call ended') {{
                   const token = localStorage.getItem('nsg_jwt_token');
                   const baseUrl = '/api/employee-portal'; // All portals use the same edit endpoint in this app
                   await fetch(`${{baseUrl}}/chat/messages/${{lastCallMsg.id}}`, {{
                      method: 'PATCH',
                      headers: {{ 'Authorization': `Bearer ${{token}}`, 'Content-Type': 'application/json' }},
                      body: JSON.stringify({{ text: 'Video call ended' }})
                   }});
                   if (typeof fetchChannelsAndMessages === 'function') {{
                      fetchChannelsAndMessages();
                   }}
                }}
             }} catch(e) {{ console.error(e); }}
             setHuddlePeer(null);
          }}}} 
        />"""
        
    content = re.sub(huddle_pattern, new_huddle, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")

for f in files:
    fix_file(f)
