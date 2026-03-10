# 🔄 CORRECT TICKET WORKFLOW - LaporAC

**Based on logtanya.txt requirements**

---

## 📋 CORRECT FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Staff Reports AC Issue                             │
│ - Scan QR Code on AC unit                                  │
│ - Fill report form (NIK auto-verifies)                     │
│ - Submit → Ticket created with status: "open"              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Admin Reviews Ticket                               │
│ - Sees ticket in /admin/tickets                            │
│ - Reviews issue details                                    │
│ - ACTION: Assign to Technician (Admin 2)                   │
│ - Sets: assigned_technician_id, priority, target_date      │
│ - Status → "assigned"                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Technician Inspects AC                             │
│ - Receives notification                                    │
│ - Goes to AC location                                      │
│ - Performs physical inspection                             │
│ - Fills inspection form:                                   │
│   • is_damage_confirmed (true/false)                       │
│   • initial_diagnosis                                      │
│   • action_type: "internal_repair" OR "needs_vendor"       │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────────────┐
              │   DECISION POINT   │
              └────────┬───────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                              ↓
┌──────────────────┐          ┌──────────────────┐
│ OPTION A:        │          │ OPTION B:        │
│ Internal Repair  │          │ Need Vendor      │
│ (Minor issue)    │          │ (Major issue)    │
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         ↓                             ↓
┌──────────────────┐          ┌──────────────────┐
│ Technician does  │          │ Technician fills │
│ repair           │          │ vendor selection │
│ Updates ticket:  │          │ form:            │
│ - action_type    │          │ - vendor_id      │
│ - resolution     │          │ - issue_desc     │
│ - cost           │          │ - urgency        │
│ Status:         │          │ Creates SPK:     │
│ "in_progress"   │          │ - ticket_id      │
│                 │          │ - vendor_id      │
│                 │          │ - status: "sent" │
│                 │          │ Status →         │
│                 │          │ "vendor_assigned"│
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         │                             ↓
         │                    ┌──────────────────┐
         │                    │ STEP 4: Vendor   │
         │                    │ - Receives SPK   │
         │                    │ - Accepts job    │
         │                    │ - Does repair    │
         │                    │ - Uploads photos │
         │                    │ - Submits report │
         │                    │ - Sets:          │
         │                    │   • completion_  │
         │                    │     notes        │
         │                    │   • repair_cost  │
         │                    │   • photos[]     │
         │                    │ Status →         │
         │                    │ "completed"      │
         │                    └────────┬─────────┘
         │                             │
         └──────────────┬──────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Admin Verifies Completion                          │
│ - Reviews completion report                                │
│ - Checks photos & costs                                    │
│ - Fills verification form:                                 │
│   • is_satisfied (true/false)                              │
│   • validation_notes                                       │
│ - If satisfied:                                            │
│   • Status → "resolved"                                    │
│   • Warranty period starts (3 months)                      │
│   • Asset warranty_expiry extended                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Warranty Period (3 Months)                         │
│ - Asset has warranty_status: "active"                      │
│ - warranty_expiry = completion_date + 3 months             │
│ - If same issue reoccurs:                                  │
│   • New ticket created                                     │
│   • Marked as "warranty_claim"                             │
│   • Vendor called again (no cost)                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Generate Berita Acara                              │
│ - After warranty period OR after completion                │
│ - Admin clicks "Generate Berita Acara"                     │
│ - Auto-creates from SPK data                               │
│ - Includes:                                                │
│   • Asset info                                             │
│   • Repair details                                         │
│   • Parts replaced                                         │
│   • Total cost                                             │
│   • Warranty info                                          │
│ - PDF generated for billing                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ROLES & RESPONSIBILITIES

### **Admin (GA Staff)**
1. Review tickets
2. Assign to technician
3. Verify completion
4. Generate Berita Acara

### **Technician (Admin 2 / Internal)**
1. Inspect AC
2. Decide: internal repair OR vendor needed
3. If internal: do repair, mark complete
4. If vendor: select vendor, create SPK

### **Vendor**
1. Receive SPK notification (email)
2. Accept SPK
3. Perform repair
4. Upload photos + report
5. Mark complete

### **Super Admin**
- All permissions
- Manage users, roles, permissions
- Configure system settings

---

## 📊 TICKET STATUS FLOW

```
open
  ↓
assigned (to technician)
  ↓
in_progress (technician working OR vendor working)
  ↓
pending_verification (work done, waiting admin check)
  ↓
resolved (admin verified, warranty starts)
  ↓
closed (warranty period ended)
```

**Special Statuses:**
- `rejected`: Not a valid issue / false alarm
- `warranty_claim`: Reoccurrence during warranty period

---

## 🔧 WHAT NEEDS TO CHANGE

### **Current Ticket Detail Page Issues:**
1. ❌ Has 5-stage workflow (Validation → Inspection → Action → Completion → Verification)
2. ❌ Validation stage doesn't exist in new flow
3. ❌ Doesn't match logtanya.txt requirements

### **New Ticket Detail Page Should Have:**

**For Admin:**
1. **Assignment Section**
   - Select technician from dropdown
   - Set priority
   - Set target date
   - Button: "Assign to Technician"

**For Technician:**
2. **Inspection Section**
   - Confirm damage (Yes/No)
   - Initial diagnosis field
   - Action type selector: "Internal Repair" or "Need Vendor"
   - Button: "Submit Inspection"

3. **If Internal Repair:**
   - Resolution notes
   - Cost field
   - Button: "Mark Complete"

4. **If Need Vendor:**
   - Select vendor dropdown
   - Issue description
   - Urgency selector
   - Button: "Create SPK & Assign Vendor"

**For Vendor:**
5. **Completion Section**
   - Completion notes
   - Cost breakdown
   - Photo upload
   - Button: "Submit Completion Report"

**For Admin (again):**
6. **Verification Section**
   - Review completion report
   - Satisfaction toggle (Yes/No)
   - Validation notes
   - Button: "Verify & Close Ticket"

---

## 📝 NEXT STEPS

1. **Update ticket-detail.html** - New UI with 6 sections based on role
2. **Update ticket-detail.ts** - New methods for each workflow step
3. **Update backend** - Ensure API supports new flow
4. **Test complete workflow** - From report to warranty

---

**Status**: Ready for implementation  
**Priority**: HIGH  
**Based on**: logtanya.txt requirements
