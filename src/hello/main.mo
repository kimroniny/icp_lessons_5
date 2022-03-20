import List "mo:base/List";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

actor {
    stable var name: Text = "kimroniny";
    public type Message = {
        author: Text;
        text: Text; 
        time: Time.Time
        };
    stable var followed: List.List<(Principal, Text)> = List.nil();
    stable var messages: List.List<Message> = List.nil();

    public type Microblog = actor {
        set_name: shared (Text, Text) -> async ();
        get_name: shared query () -> async ?Text;
        follow: shared (Principal) -> async();
        follows: shared query () -> async [Principal];
        post: shared (Text, Text) -> async ();
        posts: shared query (Time.Time) -> async [Message];
        timeline: shared ([Principal], Time.Time) -> async [Message];
    };

    public shared func follow(id : Principal) : async () {
        let canister : Microblog = actor(Principal.toText(id));
        let author = switch (await canister.get_name()) {
            case null "invalid author name!!!";
            case (?Text) Text; 
        };
        followed := List.push((id, author), followed);
    };

    public shared query func follows() : async [(Principal, Text)] {
        List.toArray(followed)
    };

    public shared (msg) func post(opt: Text, text: Text) : async (Time.Time) {
        assert(opt == "kimroniny");
        let now = Time.now();
        let postMsg = {
            author = name;
            text = text; 
            time = now;
            };
        messages := List.push(postMsg, messages);
        now
    };

    public shared query func posts(since: Time.Time) : async [Message] {
        let sinceList = List.filter(
            messages, 
            func(msg: Message) : Bool{
                msg.time > since
            }
        );
        List.toArray(sinceList)
    };

    public shared func timeline(author: [Principal], since: Time.Time) : async [Message] {
        var all : List.List<Message> = List.nil();
        var authorList : List.List<Principal> = List.nil();
        let getId = func ((id: Principal, name: Text)) : Principal{
            id
        };
        if (author.size() == 0){
            authorList := List.map(followed, getId);
        }else {
            authorList := List.fromArray(author);
        };
        for (id in Iter.fromList(authorList)) {
            let canister : Microblog = actor(Principal.toText(id));
            let msgs = await canister.posts(since);
            for (msg in Iter.fromArray(msgs)) {
                all := List.push(msg, all)
            }
        };
        List.toArray(all)
    };
    public shared func set_name(opt: Text, uname : Text) : async () {
        assert(opt == "kimroniny");
        name := uname;
    };
    public shared query func get_name() : async ?Text {
        ?name
    };

}