<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ page import="java.net.MalformedURLException" %>
<%@ page import="java.net.URL" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.io.IOException" %>
<%@ page import="java.util.regex.Matcher" %>
<%@ page import="java.util.regex.Pattern" %>

<%
	String appId = null;
	String appSecret = null;
%>
<%@ include file="/config.jsp" %>
<%
	// Don’t forget to edit config and set actual App ID and App secret.
	if ( appId == null || appSecret == null || appId.equals("") || appSecret.equals("") )
		response.sendError(500, "Not specified App ID or App secret");

	String fbLoginUrl = "http://www.facebook.com/dialog/oauth/?client_id=" + appId
					  + "&scope=user_photos&redirect_uri=" + request.getRequestURL().toString();
    
	String fbResultCode  = request.getParameter("code");

	// If user declines authorization request, error=access_denied 
	String fbResultError = request.getParameter("error");
	
	// Authorization from client-side (see /pub/auth.html).
	String tokenToExtend = request.getParameter("extend");


	if (tokenToExtend != null) {

		String fbExtendTokenUrl = "https://graph.facebook.com/oauth/access_token?client_id=" + appId
								+ "&client_secret=" + appSecret
								+ "&grant_type=fb_exchange_token&fb_exchange_token=" + tokenToExtend;

		String resultExt = pollUrl(fbExtendTokenUrl);

		%>
		EXTENDED TOKEN: <code><%= getToken(resultExt) %></code><br />
		Valid for: <%= getTokenTime(resultExt) %> seconds.
		<%

	} else if (fbResultError != null) {

		%>
		<h3>Error: You have denied access</h3>
		<%

	} else if (fbResultCode != null) {
		//Server-side request:

		String fbGetTokenUrl = "https://graph.facebook.com/oauth/access_token?client_id=" + appId
							 + "&client_secret=" + appSecret
							 + "&code=" + fbResultCode
							 + "&redirect_uri=" + request.getRequestURL().toString();

		String result = pollUrl(fbGetTokenUrl);

		//if (result != null) { ... }
		%>
		TOKEN: <code><%= getToken(result) %></code><br />
		Valid for: <%= getTokenTime(result) %> seconds.
		<%

	} else {
		%>
		<script>top.location.href='<%= fbLoginUrl %>';</script>
		<%
	}
%>


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

public String getToken(String data)
{
    Pattern pattern = Pattern.compile("access_token=([^&]+)(?:&expires=(.*))?");
    Matcher matcher = pattern.matcher(data);
	if ( !matcher.matches() )
		return null;
	return matcher.group(1);
} // getToken

public String getTokenTime(String data)
{
    Pattern pattern = Pattern.compile("access_token=([^&]+)&expires=(.*)");
    Matcher matcher = pattern.matcher(data);
	if ( !matcher.matches() )
		return null;
	return matcher.group(2);
} // getTokenTime

%>
