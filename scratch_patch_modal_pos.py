import re

file_path = "src/components/ceo/pages/Payroll/CeoPayroll.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract the modal block
modal_start_str = "      {showMappingModal && ("
modal_end_str = "      )}\n\n  return ("

# Find the indices
start_idx = content.find(modal_start_str)
end_idx = content.find(modal_end_str)

if start_idx != -1 and end_idx != -1:
    modal_block = content[start_idx:end_idx + len("      )}\n")]
    
    # Remove from original location
    content = content.replace(modal_block, "")
    
    # Insert right after `return (`
    return_str = "  return (\n    <div className=\"ceo-payroll-container\">\n"
    new_return_str = return_str + modal_block
    
    content = content.replace(return_str, new_return_str)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed modal position")
else:
    print("Could not find modal block")
