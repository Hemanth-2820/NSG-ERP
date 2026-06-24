import os
import re

files = [
    ("src/components/employee/Messaging.jsx", "String(currentUser?.id || 'emp')"),
    ("src/components/ceo/pages/Messaging.jsx", "'ceo'"),
    ("src/components/hr/modules/messaging/HrMessagingView.jsx", "'hr'"),
    ("src/components/tl/Messaging & Meet/messages.module.index.jsx", "String(currentUser?.id || 'tl')")
]

for file_path, user_id_str in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Fix 1: Filter myChannels to exclude dm- and include only if user is member
    old_my_channels = [
        "const myChannels = chatChannels;", # CEO/HR
        "const myChannels = chatChannels; // CEO has access to ALL channels", # CEO/HR
        "const myChannels = chatChannels.filter(c => c.id === \"general-channel\" || (c.members && c.members.includes(String(currentUser?.id || 'emp'))));", # Employee
        "const myChannels = chatChannels.filter(c => c.id === \"general-channel\" || (c.members && c.members.includes(String(currentUser?.id || 'tl'))));" # TL
    ]
    
    new_my_channels = f"const myChannels = chatChannels.filter(c => !c.id.startsWith('dm-') && (c.id === \"general-channel\" || (c.members && c.members.includes({user_id_str}))));"

    for old_str in old_my_channels:
        content = content.replace(old_str, new_my_channels)

    # Fix 2: Filter the Forward Modal CHANNELS list
    old_fwd1 = "{(typeof dbChannels !== 'undefined' ? dbChannels : (typeof chatChannels !== 'undefined' ? chatChannels : [])).map(c => ("
    new_fwd1 = "{(typeof dbChannels !== 'undefined' ? dbChannels : (typeof chatChannels !== 'undefined' ? chatChannels : [])).filter(c => !c.id.startsWith('dm-')).map(c => ("
    content = content.replace(old_fwd1, new_fwd1)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Fixed channel visibility across all portals.")
