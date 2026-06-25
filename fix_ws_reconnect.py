import re
import os

files = [
    r"src\components\employee\Messaging.jsx",
    r"src\components\ceo\pages\Messaging.jsx",
    r"src\components\hr\modules\messaging\HrMessagingView.jsx",
    r"src\components\tl\Messaging & Meet\messages.module.index.jsx"
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'wsReconnectTrigger' in content:
        print(f"Already processed {file}")
        continue

    # 1. Add state variable
    content = content.replace("const socketRef = useRef(null);", "const socketRef = useRef(null);\n  const [wsReconnectTrigger, setWsReconnectTrigger] = useState(0);")

    # 2. Add onclose to the socket
    # Find `socket.onerror = (e) => { ... };` and append `socket.onclose`
    onerror_pattern = r"(socket\.onerror\s*=\s*\(e\)\s*=>\s*\{[\s\S]*?\};)"
    onclose_code = """
    socket.onclose = () => {
      setTimeout(() => {
         setWsReconnectTrigger(prev => prev + 1);
      }, 5000);
    };"""
    content = re.sub(onerror_pattern, r"\1" + onclose_code, content)

    # 3. Add wsReconnectTrigger to the useEffect dependency array
    # The useEffect starts with `const wsProtocol = window.location.protocol`
    # and ends with `}, [chatChannels, employees]);` or similar.
    # We can use a regex to find the end of that specific useEffect.
    
    # We know the useEffect contains `const wsProtocol`.
    # Let's find the `}, [something]);` that closes it.
    
    # We can split by `const wsProtocol`
    parts = content.split("const wsProtocol = window.location.protocol")
    if len(parts) == 2:
        before = parts[0]
        after = parts[1]
        
        # find the first `}, [` in `after`
        idx = after.find("}, [")
        if idx != -1:
            end_idx = after.find("]);", idx)
            if end_idx != -1:
                deps = after[idx+4:end_idx]
                new_deps = deps + ", wsReconnectTrigger" if deps else "wsReconnectTrigger"
                after = after[:idx+4] + new_deps + after[end_idx:]
                content = before + "const wsProtocol = window.location.protocol" + after
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Processed {file}")
