module.exports = {"name":"Support Ticket","description":"Support ticket objects describe requests to the Linode support team.\n","schema":{"id":{"_type":"integer","_value":1234,"_description":"This ticket's ID"},"summary":{"_type":"string","_value":"A summary of the ticket.","_description":"This is summary or title for the ticket.","_limit":"1-64 characters"},"description":{"_type":"string","_value":"More details about the ticket.","_description":"The full details of the issue or question.","_limit":"1-65535 characters"},"status":{"_type":"enum","_subtype":"Status","_value":"open","_description":"The status of the ticket.","_filterable":true},"opened":{"_type":"datetime","_value":"2017-02-23T11:21:01","_filterable":true},"closed":{"_type":"datetime","_value":"2017-02-25T03:20:00","_filterable":true},"closed_by":{"_type":"string","_value":"some_user","_description":"The user who closed this ticket."},"updated":{"_type":"datetime","_value":"2017-02-23T11:21:01","_filterable":true},"updated_by":{"_type":"string","_value":"some_other_user","_description":"The user who last updated this ticket."},"entity":{"_description":"The entity this ticket was opened regarding","id":{"_type":"integer","_value":9302,"_description":"The entity's ID that this event is for.  This is meaningless without a type.\n"},"label":{"_type":"string","_value":"linode123","_description":"The current label of this object.  This will reflect changes in label.\n"},"type":{"_type":"string","_value":"linode","_description":"The type of entity this is related to.\n"},"url":{"_type":"string","_value":"/v4/linode/instances/123","_description":"The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n"}}},"enums":{"Status":{"new":"The support ticket has just been opened.","open":"The support ticket is open and can be replied to.","closed":"The support ticket is completed and closed."}}};