<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%

	// FIXME: move to config
	String appId	 = "499533806725155";
	String appSecret = "";


	String fbLoginUrl = "http://www.facebook.com/dialog/oauth/?client_id=" + appId
					  + "&scope=user_photos&redirect_uri=" + request.getRequestURL().toString();
    
	// "<script>top.location.href='" + fbLoginUrl + "';</script>"

	String fbResultCode  = request.getParameter("code");

	// If user declines authorization request, error=access_denied 
	String fbResultError = request.getParameter("error");


	if (fbResultError != null) {

%>
<h3>Error: You have denied access</h3>
<%

	} else if (fbResultCode != null) {

/*
Server-side request:

= "https://graph.facebook.com/oauth/access_token?client_id=" + appId
+ "&client_secret=" + appSecret
+ "&code=" + fbResultCode
+ "&redirect_uri=" + request.getRequestURL().toString() 


RESULTS:


access_token=USER_ACCESS_TOKEN&expires=NUMBER_OF_SECONDS_UNTIL_TOKEN_EXPIRES

OR (wrong code):

{
   "error": {
      "type": "OAuthException",
      "message": "Error validating verification code."
   }
}
*/


%>
CODE:<br /><%= fbResultCode %>
<%

	} else {
%>
OK: 

<a href="<%= fbLoginUrl %>"><%= fbLoginUrl %></a>


<%
	}
%>