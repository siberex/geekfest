<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ page import="java.net.MalformedURLException" %>
<%@ page import="java.net.URL" %>
<%@ page import="java.net.URI" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.io.IOException" %>


<%!
public String pollUrl(String urlStr)
{
	try {
		URL url = new URL(urlStr);
		BufferedReader reader = new BufferedReader(
			new InputStreamReader( url.openStream() )
		);

		String result = "";
		String line;
		while ( (line = reader.readLine() ) != null ) {
			result += line;
		}
		reader.close();
		return result;
	} catch (IOException e) {
		return null;
	}
} // pollUrl
%>


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
		//Server-side request:

		String fbGetTokenUrlString = "https://graph.facebook.com/oauth/access_token?client_id=" + appId
								   + "&client_secret=" + appSecret
								   + "&code=" + fbResultCode
								   + "&redirect_uri=" + request.getRequestURL().toString();

		String result = pollUrl(fbGetTokenUrlString);

		/*
		RESULT string:
		access_token=USER_ACCESS_TOKEN&expires=NUMBER_OF_SECONDS_UNTIL_TOKEN_EXPIRES

		OR json (if wrong code was passed):
		{
		   "error": {
			  "type": "OAuthException",
			  "message": "Error validating verification code."
		   }
		}
		*/

		if (result != null) {
			URI uri = new URI(result);





		}
			%>
RESPONSE: <%= result %>
<br /><br />
			<%




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

