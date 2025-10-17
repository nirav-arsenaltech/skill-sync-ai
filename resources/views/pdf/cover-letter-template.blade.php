<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Cover Letter</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #222; margin: 40px; }
        .container { max-width: 800px; margin: auto; background: #fff; padding: 36px; border-radius: 6px; }
        .header { border-bottom: 2px solid #e6e6e6; padding-bottom: 10px; margin-bottom: 18px; }
        .name { font-size: 24px; color: #0b63c6; font-weight: 700; }
        .contact-line { font-size: 13px; color: #555; margin-top: 6px; }
        a.link { color: #0b63c6; text-decoration: none; }
        .divider { height: 1px; background: #eee; margin: 20px 0; }
        .letter { font-size: 15px; line-height: 1.6; color: #333; }
        .footer { margin-top: 30px; font-size: 12px; color: #888; text-align:center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="name">{{ $name ?? 'Applicant' }}</div>

            <div class="contact-line">
                @php
                    $parts = [];
                    if(!empty($email)) $parts[] = e($email);
                    if(!empty($phone)) $parts[] = e($phone);
                    if(!empty($linkedin)) {
                        $link = $linkedin;
                        if(!preg_match('#^https?://#i', $link)) $link = 'https://'.$link;
                        $parts[] = '<a class="link" href="'.e($link).'">'.e($linkedin).'</a>';
                    }
                @endphp
                {!! implode(' &nbsp;|&nbsp; ', $parts) !!}
            </div>
        </div>

        <div class="letter">
            {!! $coverLetterHtml !!}
        </div>

        <div class="footer">
        </div>
    </div>
</body>
</html>
