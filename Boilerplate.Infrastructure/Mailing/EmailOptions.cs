namespace Boilerplate.Infrastructure.Mailing;

internal class EmailOptions
{
    public string From { get; set; }
    public string DisplayName { get; set; }
    public string SMTPServer { get; set; }
    public int SMTPPort { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}